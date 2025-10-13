import os
import json
import pdfplumber
from openai import OpenAI
from langsmith import traceable
from pydantic import BaseModel
from typing import List

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

SYSTEM_MSG = (
    "You are a legal-document structuring assistant. Identify page ranges of the four core segments of regulation pdfs: "
    "Title, Preamble, Enacting terms, Annexes. Return ONLY JSON per schema."
)

MODEL = "gpt-5-mini"  # or "gpt-4o" / "gpt-5"

class Segment(BaseModel):
    name: str
    start: int | None
    end: int | None

class SegmentationResult(BaseModel):
    segments: List[Segment]


@traceable(run_type="chain")
def segmentation(doc_text, total_pages):
    user_msg = (
        "Given the regulation pdf text, look through all the pages and segment the text accordingly.\n"
        f"Regulation pdf text:\n{doc_text}\n\n"
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
    )


    response = client.responses.parse(
        model=MODEL,
        input=[
            {"role": "system", "content": SYSTEM_MSG},
            {"role": "user", "content": user_msg},
        ],
        text_format=SegmentationResult,
    )
    result = response.output_parsed
    enacting = next(s for s in result.segments if s.name == "Enacting terms")  # raises StopIteration if not found [web:29][web:38]
    return [enacting.start,enacting.end]



def extract_pdf_text(file_stream):
    """Extract text per page from a PDF stream, returns a string with page markers and total page count."""
    pages_text = []
    file_stream.seek(0)
    with pdfplumber.open(file_stream) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            pages_text.append(f"[Page {i}]\n{text}")
    return "\n\n".join(pages_text), total_pages


# if __name__ == "__main__":
#     # 🔧 Hardcode your PDF path here
#     pdf_path = "eu_cookie_new.pdf"

#     if not os.path.exists(pdf_path):
#         print(f"Error: File '{pdf_path}' not found.")
#         exit(1)

#     print(f"Processing: {pdf_path}")

#     with open(pdf_path, "rb") as f:
#         doc_text, total_pages = extract_pdf_text(f)

#     print(f"Total pages detected: {total_pages}\n")
#     print("Running segmentation with GPT...\n")


#     result = segmentation(doc_text, total_pages)
#     enacting = next(s for s in result.segments if s.name == "Enacting terms")  # raises StopIteration if not found [web:29][web:38]
#     print([enacting.start, enacting.end])  # simple attribute access [web:25][web:22]