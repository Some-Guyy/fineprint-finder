import os
import json
import pdfplumber
from perplexity import Perplexity
from langsmith import traceable

client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

SYSTEM_MSG = (
    "You are a legal-document structuring assistant. Identify page ranges of the four core segments of regulation pdfs: "
    "Title, Preamble, Enacting terms, Annexes. Return ONLY JSON per schema."
)

MODEL = "sonar"


@traceable(run_type="chain")
def segmentation(doc_text,total_pages):
    user_msg = (
        "Given the regulation pdf text,look through all the pages and segment the text accordingly"
        f"regulation pdf text:{doc_text}\n\n"
        "Detection rules:\n"
        "- Title: formal title block at the start (institution line, act type, number/date, subject). "
        "Stop before the first ‘Having regard to’ line if present.\n"
        "- Preamble: the ‘Having regard to …’ block and numbered ‘Whereas (n)’ recitals; include the enacting formula "
        "if it appears at the preamble’s end; stop just before the first ‘Article 1’ heading.\n"
        "- Enacting terms: from the enacting formula or ‘Article 1’ onward, including all Articles and higher-level headings "
        "(Parts/Titles/Chapters/Sections); stop just before the first page that begins an Annex block.\n"
        "- Annexes: any content labeled ‘Annex’, ‘Annex I/II…’, ‘Appendix’, or ‘Schedule’, in order.\n\n"
        "Overlap rule: If boundary content is shared (e.g., enacting formula appears at the end of the preamble and also marks the start of enacting terms), "
        "IT IS ACCEPTABLE for page ranges to overlap; capture the full extent of each segment even if ranges are not disjoint.\n\n"
        "Anchoring evidence (internal): For each segment, locate at least one boundary anchor near the start and one near the end "
        "(examples: ‘Having regard to’, ‘Whereas’, ‘HAVE ADOPTED THIS DIRECTIVE/REGULATION’, ‘Article 1’, ‘Annex I’). "
        "Use these anchors to determine page transitions; if an exact anchor is not found, return [null,null] for that segment.\n\n"
        "Output strictly as JSON per schema; no extra text:\n"
        "{\n"
        '  "title": [start, end],\n'
        '  "preamble": [start, end],\n'
        '  "enacting_terms": [start, end],\n'
        '  "annexes": [start, end]\n'
        "}"
    )
    pages_schema = {
    "type": "object",
    "properties": {
        "title": {
            "type": "array",
            "items": {"anyOf": [
                {"type": "integer", "minimum": 1, "maximum": total_pages},
                {"type": "null"}
            ]},
            "minItems": 2,
            "maxItems": 2,
        },
        "preamble": {
            "type": "array",
            "items": {"anyOf": [
                {"type": "integer", "minimum": 1, "maximum": total_pages},
                {"type": "null"}
            ]},
            "minItems": 2,
            "maxItems": 2,
        },
        "enacting_terms": {
            "type": "array",
            "items": {"anyOf": [
                {"type": "integer", "minimum": 1, "maximum": total_pages},
                {"type": "null"}
            ]},
            "minItems": 2,
            "maxItems": 2,
        },
        "annexes": {
            "type": "array",
            "items": {"anyOf": [
                {"type": "integer", "minimum": 1, "maximum": total_pages},
                {"type": "null"}
            ]},
            "minItems": 2,
            "maxItems": 2,
        },
    },
    "required": ["title", "preamble", "enacting_terms", "annexes"],
    "additionalProperties": False,
  }

    messages = [
        {"role": "system", "content": SYSTEM_MSG},
        {"role": "user", "content": user_msg},
    ]

    completion = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=messages,
        response_format={"type": "json_schema", "json_schema": {"schema": pages_schema}},
    )

    # safer way to access response
    content = completion.choices[0].message.content
    if not content:
        raise RuntimeError("Empty response from model. Check file size/type or increase max_tokens.")

    obj = json.loads(content)
    return json.dumps(obj, indent=2, ensure_ascii=False)


def extract_pdf_text(file_stream):
    """Extract text per page from a PDF stream, returns a string with page markers and total page count."""
    pages_text = []
    # reset stream pointer to start, in case it's already been read
    file_stream.seek(0)
    with pdfplumber.open(file_stream) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            pages_text.append(f"[Page {i}]\n{text}")
    return "\n\n".join(pages_text), total_pages
