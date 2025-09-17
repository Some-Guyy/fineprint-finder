import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_perplexity import ChatPerplexity
from services.s3 import s3, bucket

chat_perplexity = ChatPerplexity(temperature=0, model="sonar")

system_compare = (
    "You are a precise assistant that compares regulations and outputs structured JSON only"
    "Rely only on the provided 'Before' and 'After' documents."
)

human_compare = """User:
Compare the regulation Before vs After at these links:

Before: {before_url}
After: {after_url}

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

def analyze_pdfs(before_key: str, after_key: str) -> list:

    before_url = s3.generate_presigned_url(
        "get_object", Params={"Bucket": bucket, "Key": before_key}, ExpiresIn=100
    )
    after_url = s3.generate_presigned_url(
        "get_object", Params={"Bucket": bucket, "Key": after_key}, ExpiresIn=100
    )
    response = chain_compare.invoke({"before_url": before_url, "after_url": after_url})
    content = response.content
    
    return json.loads(content)
 