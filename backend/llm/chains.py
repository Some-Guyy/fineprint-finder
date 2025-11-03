import os
import io
import json
import time
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from llm.segmentation import segmentation, extract_pdf_text
from openai import OpenAI
from langsmith import traceable
from services.s3 import s3_client, s3_bucket

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = "gpt-5-mini"

SYSTEM_MSG = (
    "You are a legal expert. Compare regulation PDFs to find out what was changed."
)

# -----------------------
# Pydantic Schema
# -----------------------
class Change(BaseModel):
    id: str
    summary: str
    analysis: str
    change: str
    before_quote: str
    after_quote: str
    type: str
    confidence: float
    classification: str
    status: str 
    comments: List[str] = Field(default_factory=list)

class ChangeList(BaseModel):
    changes: List[Change]

# -----------------------
# Wait Helpers
# -----------------------
def wait_for_file(file_id, timeout=30):
    """Wait until an uploaded file is fully processed."""
    start = time.time()
    while True:
        file_obj = client.files.retrieve(file_id)
        if file_obj.status == "processed":
            break
        if time.time() - start > timeout:
            raise TimeoutError(f"File {file_id} not processed in {timeout}s")
        time.sleep(1)

def wait_for_vector_store_ready(vector_store_id, timeout=120):
    """Wait until all files in the vector store have status 'completed'."""
    start = time.time()
    while True:
        files = client.vector_stores.files.list(vector_store_id=vector_store_id).data
        if files and all(f.status == "completed" for f in files):
            break
        if time.time() - start > timeout:
            raise TimeoutError("Vector store files not ready in time")
        time.sleep(2)

# -----------------------
# Comparison
# -----------------------
@traceable(run_type="chain")
def comparison(vectorstore_id):
    user_msg = """
You are a legal expert specializing in regulations and compliance.  
Your task is to compare two PDFs — a "before" version and an "after" version — and identify **ALL meaningful changes** in the regulatory text.

Focus only on **substantive or legal meaning changes**.  
Do NOT include:
- Formatting differences (spacing, layout, punctuation)
- Typographical or stylistic edits
- Pure renumbering that does not alter meaning

Include only real changes that alter:
- Legal obligations
- Definitions or terms
- Scope or applicability
- Thresholds, limits, or conditions
- Data protection or compliance requirements
- Timelines, procedures, or penalties

---

For each detected change, output a JSON object with the following fields:

- id: change-1, change-2, etc. (sequential)
- summary: one sentence summarizing the change
- analysis: 2–4 sentences explaining the impact of the change
- change: the exact description of what changed
- before_quote: the relevant text from the "before" PDF, include page number
- after_quote: the relevant text from the "after" PDF, include page number
- type: one of addition, deletion, modification, renumbering, scope change, threshold change, definition change, reference update, timeline change, penalty change, procedural change, unchanged
- classification: one of Personal Identifiable Information handling, Data transfers, Cloud data usage, Others
- confidence: a float between 0.0 and 1.0 indicating confidence in the identification
- status: either "relevant" or "not-relevant"  
  - "Relevant" means the change affects financial institutions, client data, data transfers, trading systems, or regulatory compliance obligations of Nomura, a global financial institution providing investment banking, asset management, and securities services.

---

Rules:
1. Only include **meaningful, substantive regulatory changes**.  
2. Do not list stylistic or formatting differences.  
3. Keep the output in valid JSON format only — no extra text.  
4. Maintain sequential IDs (change-1, change-2, etc.).  
5. Provide enough context in before_quote and after_quote to understand the change.

"""
    response = client.responses.create(
        model=MODEL,
        input=[
            {"role": "system", "content": SYSTEM_MSG},
            {"role": "user", "content": user_msg}
        ],
        tools=[{"type": "file_search", "vector_store_ids": [vectorstore_id]}]
    )
    return response.output_text

# -----------------------
# Structuring step (parse)
# -----------------------
@traceable(run_type="chain")
def structure_changes(raw_text: str) -> ChangeList:
    """Convert raw LLM text output into a validated ChangeList using structured parsing."""
    response = client.responses.parse(
        model=MODEL,
        input=[
            {
                "role": "system",
                "content": (
                    "You are a data formatter. Convert the following text into valid JSON "
                    "matching the ChangeList schema. Ensure the result strictly follows the schema."
                ),
            },
            {"role": "user", "content": raw_text},
        ],
        text_format=ChangeList
    )
    return response.output_parsed

# -----------------------
# Auto-cleanup Helpers
# -----------------------
def delete_vector_store(vector_store_id):
    try:
        client.vector_stores.delete(vector_store_id)
    except Exception as e:
        print(f"Failed to delete vector store: {e}")

def delete_uploaded_files(file_ids):
    for fid in file_ids:
        try:
            client.files.delete(fid)
        except Exception as e:
            print(f"Failed to delete file {fid}: {e}")

# -----------------------
# Main Analysis
# -----------------------
def analyze_pdfs(before_key: str, after_path: str, auto_delete=True):
    # --- Download from S3 ---
    before_obj = s3_client.get_object(Bucket=s3_bucket, Key=before_key)
    before_stream = io.BytesIO(before_obj["Body"].read())
    before_stream.name = "before.pdf"
    before_upload = client.files.create(file=before_stream, purpose="assistants")
    wait_for_file(before_upload.id)

    # after_file = s3_client.get_object(Bucket=s3_bucket, Key=after_key)
    # after_stream = io.BytesIO(after_file["Body"].read())
    # after_stream.name = "after.pdf"
    # after_upload = client.files.create(file=after_stream, purpose="assistants")
    # wait_for_file(before_upload.id)

    after_file = Path(after_path)
    with open(after_file, "rb") as f:
        after_upload = client.files.create(
            file=("after.pdf", f),  
            purpose="assistants"
        )
    wait_for_file(after_upload.id)

    uploaded_file_ids = [before_upload.id, after_upload.id]

    # --- Create and populate vector store ---
    vector_store = client.vector_stores.create(name="knowledge_base")
    client.vector_stores.files.create(vector_store_id=vector_store.id, file_id=before_upload.id)
    client.vector_stores.files.create(vector_store_id=vector_store.id, file_id=after_upload.id)
    wait_for_vector_store_ready(vector_store.id)

    # --- Run comparison ---
    raw_output = comparison(vector_store.id)

    # --- Structure into Pydantic object ---

    structured = structure_changes(raw_output)

    # changes_list = []
    # for idx, change in enumerate(structured.changes, start=1):
    #     change.id = f"change-{idx}"          # assign sequential IDs
    #     change.status = "pending"            # set fixed status
    #     change.comments = []                 # ensure comments field exists
    #     changes_list.append(change.model_dump())  # convert Pydantic model → dict



    # --- Cleanup ---
    if auto_delete:
        delete_vector_store(vector_store.id)
        delete_uploaded_files(uploaded_file_ids)

    return structured

# -----------------------
# Run locally
# -----------------------
# if __name__ == "__main__":
#     before_key = "2025-10-02_02:12:21_eu_cookie_old.pdf"
#     after_key = "2025-10-02_02:13:03_eu_cookie_new.pdf"

#     changes_json = analyze_pdfs(before_key, after_key, auto_delete=True)
#     print(json.dumps(changes_json, indent=2, ensure_ascii=False))
