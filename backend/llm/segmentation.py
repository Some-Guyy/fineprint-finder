import os
import json
import base64
from perplexity import Perplexity
from langsmith import traceable


client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

total_pages = 26

system_msg = (
      "You are a legal-document structuring assistant. Identify page ranges of the four core segments of regulation pdfs: "
      "Title, Preamble, Enacting terms, Annexes. Return ONLY JSON per schema."
    )
user_msg = (
        f"Document attached. The document has {total_pages} pages. "
        "Return 1‑based inclusive page ranges for Title, Preamble, Enacting terms, Annexes. "
        f"Enforce 1 ≤ start ≤ end ≤ {total_pages}; if uncertain, return [null,null].\n\n"
        "Detection rules:\n"
        "- Title: formal title block at the start (institution line, act type, number/date, subject). "
        "Stop before the first ‘Having regard to’ line if present.\n"
        "- Preamble: the ‘Having regard to …’ block and numbered ‘Whereas (n)’ recitals; include the enacting formula "
        "if it appears at the preamble’s end; stop just before the first ‘Article 1’ heading.\n"
        "- Enacting terms: from the enacting formula or ‘Article 1’ onward, including all Articles and higher‑level headings "
        "(Parts/Titles/Chapters/Sections); stop just before the first page that begins an Annex block.\n"
        "- Annexes: any content labeled ‘Annex’, ‘Annex I/II…’, ‘Appendix’, or ‘Schedule’, in order.\n\n"
        "Overlap rule: If boundary content is shared (e.g., enacting formula appears at the end of the preamble and also marks the start of enacting terms), "
        "it is acceptable for page ranges to overlap; capture the full extent of each segment even if ranges are not disjoint.\n\n"
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


model = "sonar-pro"

pages_schema = {
  "type": "object",
  "properties": {
    "title": {
      "type": "array",
      "items": {
        "anyOf": [
          {"type": "integer", "minimum": 1, "maximum": total_pages},
          {"type": "null"}
        ]
      },
      "minItems": 2,
      "maxItems": 2
    },
    "preamble": {
      "type": "array",
      "items": {
        "anyOf": [
          {"type": "integer", "minimum": 1, "maximum": total_pages},
          {"type": "null"}
        ]
      },
      "minItems": 2,
      "maxItems": 2
    },
    "enacting_terms": {
      "type": "array",
      "items": {
        "anyOf": [
          {"type": "integer", "minimum": 1, "maximum": total_pages},
          {"type": "null"}
        ]
      },
      "minItems": 2,
      "maxItems": 2
    },
    "annexes": {
      "type": "array",
      "items": {
        "anyOf": [
          {"type": "integer", "minimum": 1, "maximum": total_pages},
          {"type": "null"}
        ]
      },
      "minItems": 2,
      "maxItems": 2
    }
  },
  "required": ["title", "preamble", "enacting_terms", "annexes"],
  "additionalProperties": False
}



def read_as_base64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

@traceable(run_type="chain")
def segmentation(encoded_pdf, model , user_msg, system_msg, pages_schema):
    messages = [
        {"role": "system", "content": system_msg},
        {
            "role": "user",
            "content": [
                {"type": "text", 
                "text": user_msg
                },
                {
                    "type": "file_url",
                    "file_url": {
                        "url": encoded_pdf,
                        "file_name": "document.pdf"
                    }
                }
            ]
        }
    ]
    completion = client.chat.completions.create(
        model=model,
        temperature=0,
        messages=messages,
        response_format={"type":"json_schema","json_schema":{"schema": pages_schema}}
    )
    content = completion.choices[0].message.content
    obj = json.loads(content)
    if content is None or content.strip() == "":
        raise RuntimeError("Empty response from model. Check file size/type or increase max_tokens.")
    return json.dumps(obj, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    encoded_file = read_as_base64("eu_cookie_new.pdf")

    text = segmentation(encoded_file, model , user_msg, system_msg, pages_schema)
    print(text)
