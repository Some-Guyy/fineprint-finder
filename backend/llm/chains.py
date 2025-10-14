import os
import io
import json
from pathlib import Path
from pydantic import BaseModel, Field, ValidationError
from llm.segmentation import segmentation, extract_pdf_text
from openai import OpenAI
from langsmith import traceable
from services.s3 import s3_client, s3_bucket
from typing import List

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
MODEL = "gpt-5-mini"

SYSTEM_MSG = (
    "You are a legal expert. Compare regulation PDFs across defined segments. "
    "Use the segmentation JSON as guidance for which pages to read, "
    "but if the segmentation appears misaligned, adjust slightly."
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
    classification: str  # new field
    status: str = "pending"
    comments: List[str] = Field(default_factory=list)

class ChangeList(BaseModel):
    changes: List[Change]

# -----------------------
# Comparison function
# -----------------------
@traceable(run_type="chain")
def comparison(before_text: str, after_text: str, before_range, after_range):
    user_msg = f"""
User:
Compare the enacting terms of two PDFs. give me ALL the changes found in the page range.
Before PDF page range: {before_range}
After PDF page range: {after_range}
Before PDF text: {before_text}
After PDF text: {after_text}

For each change, output:
- id: change-1, change-2, etc.
- summary: one sentence
- analysis: 2–4 sentences
- change: description
- before_quote: text with page number
- after_quote: text with page number
- type: one of addition, deletion, modification, renumbering, scope change, threshold change, definition change, reference update, timeline change, penalty change, procedural change, unchanged
- classification: one of Personal Identifiable information handling, Data transfers, Cloud data usage, Others
- confidence: float 0.0–1.0
- status: "pending"
Do NOT include explanations or extra text.
"""

    response = client.responses.parse(
        model=MODEL,
        input=[{"role": "system", "content": SYSTEM_MSG},
               {"role": "user", "content": user_msg}],
        text_format=ChangeList
    )
    return response.output_parsed


# -----------------------
# PDF Analyze function
# -----------------------
def analyze_pdfs(before_key: str, after_path: str):

    # get before
    before_obj = s3_client.get_object(Bucket=s3_bucket, Key=before_key)
    before_stream = io.BytesIO(before_obj["Body"].read())

    # get after
    after_file = Path(after_path)
    if not after_file.exists():
        raise FileNotFoundError(f"Local file not found: {after_path}")
    
    with open(after_file, "rb") as f:
        after_stream = io.BytesIO(f.read())
    
    before_text, before_total = extract_pdf_text(before_stream)
    after_text, after_total = extract_pdf_text(after_stream)

    # Get enacting_terms page ranges from segmentation
    before_range = segmentation(before_text, before_total)
    after_range = segmentation(after_text, after_total)

    # Run comparison
    changes =  comparison(before_text, after_text, before_range, after_range)
    if isinstance(changes, tuple):
        changes = changes[0]

    # Now response is ChangeList
    changes_list = []
    for idx, change in enumerate(changes.changes, start=1):
        change.id = f"change-{idx}"                 # assign sequential IDs
        changes_list.append(change.model_dump())    # convert Pydantic object to dict
        change.status = "pending"

    return changes_list

# -----------------------
# Main
# -----------------------
# if __name__ == "__main__":
#     before_key = "2025-10-09_15:27:19_eu_cookie_old.pdf"
#     after_key = "2025-10-09_15:27:31_eu_cookie_new.pdf"

    
#     changes_json = analyze_pdfs(before_key, after_key)
#     print(json.dumps(changes_json, indent=2, ensure_ascii=False))
