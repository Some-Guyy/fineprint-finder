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
    user_msg = f"""User:
    You are given the page ranges of the enacting term of the respective pdfs compare them and look for changes that compliance teams will need to know:

    Before pdf:{before_text}
    Before pdf page range {before_range}
    After pdf:{after_text}
    After pdf page range:{after_range}
    Output:
    For each change found respond with ONLY a JSON array (no extra text) and each array element must be a JSON object with these fields:
    - id (string, must increment sequentially: change-1, change-2, …)
    - summary (string, one sentence in plain language)
    - analysis (string, 2–4 sentences on implications, scope, who is affected)
    - change (string, precise description of the edit)
    - before_quote (string, exact excerpt + page number of before pdf)
    - after_quote (string, exact excerpt + page number of after pdf)
    - type (string, one of: addition | deletion | modification | renumbering | scope change | threshold change | definition change | reference update | timeline change | penalty change | procedural change | unchanged)
    - confidence (float, 0.00–1.00)

    Rules:
    - Your ENTIRE response must be a JSON array
    - Do NOT include explanations, markdown, or text outside the JSON.
    - Do NOT add comments or keys that are not listed.

    Method:
    Extract and align sections by titles/numbering; note renumbering if applicable.
    For each aligned or unmatched section, detect substantive edits; ignore cosmetic edits.
    Prefer 2–6 sentence evidence quotes per side.

    Also include:
    - Unchanged sections: list ids/titles with brief reason.
    - Potentially related edits: cross-references, global metadata (title, effective date, jurisdiction).

    Format:
    Only a list containing JSON arrays containing those same fields for each change entry.
    """
    
    messages = [
        {"role": "system", "content": SYSTEM_MSG},
        {"role": "user", "content": user_msg},
    ]

    completion = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=messages,
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

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        return {
            "error" : "Invalid JSON from LLM",
            "details": str(e),
            }
