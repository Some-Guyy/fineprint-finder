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
You are a legal expert specializing in regulations. 
Your task is to compare two PDFs — a "before" version and an "after" version — and identify all changes in the regulatory text. 

Focus on **substantive changes** in the regulations, not formatting differences.

For each change, output a JSON object with the following fields:
- id: change-1, change-2, etc. (sequential)
- summary: one sentence summarizing the change
- analysis: 2–4 sentences explaining the impact of the change
- change: the exact description of what changed
- before_quote: the relevant text from the "before" PDF, include page number
- after_quote: the relevant text from the "after" PDF, include page number
- type: one of addition, deletion, modification, renumbering, scope change, threshold change, definition change, reference update, timeline change, penalty change, procedural change, unchanged
- classification: one of Personal Identifiable Information handling, Data transfers, Cloud data usage, Others
- confidence: a float between 0.0 and 1.0 indicating how confident you are in the identification
- status: always "pending"
- comments: optional list of notes or observations

Rules:
1. Do not include any extra text outside the JSON.
2. Focus on legal meaning and obligations, not stylistic changes.
3. Only create entries for actual changes — do not invent data.
4. Maintain the sequential id order.
5. Provide full context in before_quote and after_quote, enough to understand the change.
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
        print(f"⚠️ Failed to delete vector store: {e}")

def delete_uploaded_files(file_ids):
    for fid in file_ids:
        try:
            client.files.delete(fid)
        except Exception as e:
            print(f"⚠️ Failed to delete file {fid}: {e}")

# -----------------------
# Main Analysis
# -----------------------
def analyze_pdfs(before_key: str, after_key: str, auto_delete=True):
    # --- Download from S3 ---
    before_obj = s3_client.get_object(Bucket=s3_bucket, Key=before_key)
    before_stream = io.BytesIO(before_obj["Body"].read())
    before_stream.name = "before.pdf"
    before_upload = client.files.create(file=before_stream, purpose="assistants")
    wait_for_file(before_upload.id)

    after_obj = s3_client.get_object(Bucket=s3_bucket, Key=after_key)
    after_stream = io.BytesIO(after_obj["Body"].read())
    after_stream.name = "after.pdf"
    after_upload = client.files.create(file=after_stream, purpose="assistants")
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
    try:
        structured = structure_changes(raw_output)

        # --- Attach fixed fields AFTER parsing ---
        for idx, change in enumerate(structured.changes, start=1):
            change.id = f"change-{idx}"
            change.status = "pending"          # fixed value
            change.comments = []               # fixed value

        result = [c.model_dump() for c in structured.changes]
    except Exception as e:
        print(f"⚠️ Failed to parse structured output: {e}")
        result = raw_output

    # --- Cleanup ---
    if auto_delete:
        delete_vector_store(vector_store.id)
        delete_uploaded_files(uploaded_file_ids)

    return result

# -----------------------
# Run locally
# -----------------------
# if __name__ == "__main__":
#     before_key = "2025-10-16_07:27:21_UK Data Act.pdf"
#     after_key = "2025-10-18_01:10:12_2025-10-16_07_28_04_Revised Data (Use and Access) Act 2025.pdf"

#     changes_json = analyze_pdfs(before_key, after_key, auto_delete=True)
#     print(json.dumps(changes_json, indent=2, ensure_ascii=False))
