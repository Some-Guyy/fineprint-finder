import io
import pdfplumber
import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_perplexity import ChatPerplexity

from services.s3 import s3_client, s3_bucket

chat_perplexity = ChatPerplexity(temperature=0, model="sonar")

system_compare = (
    "You are a precise assistant that compares regulations and outputs structured JSON only"
    "Rely only on the provided 'Before' and 'After' documents."
)

human_compare = """User:
Compare the regulation Before vs After at these links:

Before: {before_text}
After: {after_text}

Output:
Respond with ONLY a JSON array (no extra text) and each array element must be a JSON object with these fields:
- id (string, must increment sequentially: change-1, change-2, …)
- summary (string, one sentence in plain language)
- analysis (string, 2–4 sentences on implications, scope, who is affected)
- change (string, precise description of the edit)
- before_quote (string, exact excerpt + location)
- after_quote (string, exact excerpt + location)
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

prompt_compare = ChatPromptTemplate.from_messages([
    ("system", system_compare),
    ("human", human_compare)
])

chain_compare = prompt_compare | chat_perplexity


def analyze_pdfs(before_key: str, after_key: str):
    # Extract text from both PDFs
    before_text = extract_text_from_s3(before_key)
    after_text = extract_text_from_s3(after_key)

    # Pass text into your LLM chain
    response = chain_compare.invoke({
        "before_text": before_text,
        "after_text": after_text
    })

    content = response.content

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:

        return {
            "error" : "Invalid JSON from LLM",
            "details": str(e),
            }

def extract_text_from_s3(key: str) -> str:
    """Download a PDF from S3 and extract its text."""
    obj = s3_client.get_object(Bucket=s3_bucket, Key=key)
    pdf_stream = io.BytesIO(obj["Body"].read())

    text = []
    with pdfplumber.open(pdf_stream) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text() or "")
    return "\n".join(text)
 