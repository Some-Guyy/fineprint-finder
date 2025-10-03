import os
import io
import json
from llm.segmentation import segmentation, extract_pdf_text
from perplexity import Perplexity
from langsmith import traceable

from services.s3 import s3_client, s3_bucket
client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

SYSTEM_MSG = (
                "You are a legal expert. Compare regulation PDFs across defined segments. "
                "Use the segmentation JSON as guidance for which pages to read, "
                "but if the segmentation appears misaligned, adjust slightly."
)

MODEL = "sonar-pro"


@traceable(run_type="chain")
def comparison(before_text,after_text,before_range,after_range):
    user_msg = f"""
    You are an assistant that compares two versions of legal text (before and after) and produces a strictly valid JSON array of detected changes.

    Input:
    - Before PDF text: {before_text}
    - Before PDF enacting term page range: {before_range}
    - After PDF text: {after_text}
    - After PDF enacting term page range: {after_range}

    Task:
    Return ONLY valid JSON (UTF-8). The response MUST be a single JSON array. 
    Each array element must be a JSON object with exactly these fields:
    - id (string, sequential: change-1, change-2, …)
    - summary (string, one plain-language sentence)
    - analysis (string, 2–4 sentences: implications, scope, who is affected)
    - change (string, precise description of the edit)
    - before_quote (string, exact excerpt from BEFORE text with page number)
    - after_quote (string, exact excerpt from AFTER text with page number)
    - type (string, one of: addition | deletion | modification | renumbering | scope change | threshold change | definition change | reference update | timeline change | penalty change | procedural change | unchanged)
    - confidence (float between 0.0 and 1.0)

    Strict Rules:
    - Output MUST be valid JSON. No markdown, no text before or after.
    - Escape all quotes and newlines inside strings properly.
    - Do not include keys other than those listed.
    - If there are no changes, return [].

    Guidelines:
    - Align sections by titles/numbering; note renumbering if applicable.
    - Capture substantive edits only; ignore cosmetic formatting changes.
    - Quotes should be 2–6 sentences long for context.
    - Only mark "unchanged" if you are highly certain there is no substantive difference.

    Valid JSON example format (do not include commentary):

    [
        {{
            "id": "change-1",
            "summary": "Threshold increased from 100 to 200 units.",
            "analysis": "This broadens the scope of compliance, affecting small entities. Larger organizations are less impacted.",
            "change": "Threshold raised from 100 to 200 units.",
            "before_quote": "Page 12: 'Entities with more than 100 units...'",
            "after_quote": "Page 12: 'Entities with more than 200 units...'",
            "type": "threshold change",
            "confidence": 0.87
        }}
    ]
    """

    
    messages = [
        {"role": "system", "content": SYSTEM_MSG},
        {"role": "user", "content": user_msg},
    ]

    completion = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=messages,
        response_format={"type": "json_schema", "json_schema": {"schema": output_schema}},
    )

    content = completion.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response from model. Check file size/type or increase max_tokens.")

    obj = json.loads(content)
    return json.dumps(obj, indent=2, ensure_ascii=False)


def analyze_pdfs(before_key: str, after_key: str):
    before_pdf_obj = s3_client.get_object(Bucket=s3_bucket, Key=before_key)
    after_pdf_obj = s3_client.get_object(Bucket=s3_bucket, Key=after_key)
    before_pdf_stream = io.BytesIO(before_pdf_obj["Body"].read())
    after_pdf_stream = io.BytesIO(after_pdf_obj["Body"].read())
    
    # Get segmentation for both PDFs
    before_doc_text, before_total_pages = extract_pdf_text(before_pdf_stream)
    after_doc_text, after_total_pages = extract_pdf_text(after_pdf_stream)
    
    # Extract text and label them
    before_range = json.loads(segmentation(before_doc_text, before_total_pages))["enacting_terms"]
    after_range = json.loads(segmentation(after_doc_text, after_total_pages))["enacting_terms"]
    
    content = comparison(before_doc_text, after_doc_text, before_range, after_range)

    return json.loads(content)
