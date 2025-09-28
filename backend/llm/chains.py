import os
import json
from perplexity import Perplexity
from langchain_core.runnables import RunnableLambda
from langsmith import traceable 



@traceable(run_type="chain")  
def compare_regs(model, before_url, after_url):
    """
    Minimal wrapper: provide model and two file URLs.
    Returns the JSON list on success, or {"text": raw_output} on parse failure.
    """
    client = Perplexity(api_key=os.environ.get("PERPLEXITY_API_KEY"))

    system_msg = (
        "You are a precise assistant that compares regulations and outputs structured JSON only. "
        "Rely only on the provided 'Before' and 'After' documents. "
        "Your ENTIRE response must be a JSON array; no extra text."
    )

    user_msg = (
        "Compare the regulation Before vs After.\n\n"
        "Before: See attached Before document\n"
        "After: See attached After document\n\n"
        "Output:\n"
        "Respond with ONLY a JSON array (no extra text) and each array element must be a JSON object with these fields:\n"
        "- id (string, must increment sequentially: change-1, change-2, …)\n"
        "- summary (string, one sentence in plain language)\n"
        "- analysis (string, 2–4 sentences on implications, scope, who is affected)\n"
        "- change (string, precise description of the edit)\n"
        "- before_quote (string, exact excerpt + location)\n"
        "- after_quote (string, exact excerpt + location)\n"
        "- type (string, one of: addition | deletion | modification | renumbering | scope change | threshold change | definition change | reference update | timeline change | penalty change | procedural change | unchanged)\n"
        "- confidence (float, 0.00–1.00)\n\n"
        "Rules:\n"
        "- Your ENTIRE response must be a JSON array\n"
        "- Do NOT include explanations, markdown, or text outside the JSON.\n"
        "- Do NOT add comments or keys that are not listed.\n\n"
        "Method:\n"
        "Extract and align sections by titles/numbering; note renumbering if applicable.\n"
        "For each aligned or unmatched section, detect substantive edits; ignore cosmetic edits.\n"
        "Prefer 2–6 sentence evidence quotes per side.\n\n"
        "Also include:\n"
        "- Unchanged sections: list ids/titles with brief reason.\n"
        "- Potentially related edits: cross-references, global metadata (title, effective date, jurisdiction).\n\n"
        "Format:\n"
        "Only a list containing JSON arrays containing those same fields for each change entry."
    )

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": [
            {"type": "text", "text": user_msg},
            {"type": "file_url", "file_url": {"url": before_url, "file_name": "before.pdf"}},
            {"type": "file_url", "file_url": {"url": after_url,  "file_name": "after.pdf"}},
        ]},
    ]

    completion = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0,
    )
    output = completion.choices[0].message.content

    try:
        return json.loads(output)
    except json.JSONDecodeError:
        return {"text": output}
    

# your compare_regs(model, before_url, after_url) from earlier
CompareRunnable = RunnableLambda(lambda x: compare_regs(x["model"], x["before_url"], x["after_url"]))

if __name__ == "__main__":
    result = CompareRunnable.invoke({
        "model": "sonar",
        "before_url": "https://fypwhere.s3.ap-southeast-2.amazonaws.com/eu_cookie_old.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAkaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAIJ4qBT%2BaWDllG%2Bj5ZobfKCDua15RZXJ6ZXu1q%2FFZnsqAiEAz2Ai3d52BF1N9PdiKsE1k4npjM0GrqPvYBQVlxZXVGkqvgMIkv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw5OTg1ODM1MzUyMjgiDFKqtkZwzOcCf5kGQSqSA7PUqvhuX5g4KFALmbFZpPu3rRfqGmv5Ahlv0yBttGfKFhzVPwdZ37xnHzQRbqWGjmO9GjgVoZ0ywe8mZsRR5jLuX0I9x6ymX3jV1R8ZnVAIZv3Nh4R6erGHvt1%2B%2BXJR3PH31VccT6gR1rEwgvPxirf2mc4EiGBOwV2Yj2m9goZ%2BZO%2BcCOI2iU1oAcLsBFje1Wfqfv4gKEjLS9lhXKZnj2AeNWo%2FDctF0KVSey9kc9P%2BqXkr%2B86yS2TF9JWG8VJzPEz35XUgWZflfGd%2BTqp0ltf6bvvFzoWyPlJ6wOADEFoBJ1Mz16TRJcJZNU5puSGOI%2FtYCrE6CRM50ATnY2Wr9emzEytQKSbLPaIhgTs7rNUFIj4pzifDGWpm6EzQzQZflzmCH2Wv7reTvjFBr25QAq9NS900u6ucrYEYEAEF3IYzVdT%2Bb2qr5zpmNgCj5JP8AfDARp%2Bsjw2qdd4P8ujRdQ3YDvqFi7XX7B0qtgznn3TJU719MqFX6NX9fJ1O0OLikZLT9b%2FLz8pLwUsZAg%2BwHdzHOTDV3dnGBjrdAvYlEo2ljjHrWKt9yGye571ys3u%2BzeysJBQqI9I7ADrb0YbsE4ax4BtCX1TrzfJ2bF%2FrzgUdVigZlgd2aE29WhbRcHS%2FFZpfiSioCSPTAZ5Jf6NLjUk%2F1u9WbNfcBcZNsF12UbebVHbRdv02QDrywYRArlcTwd6YnA39a19Hhbg5oE9JzyHIl69gsXY6%2FBa1YtSaH6Ow81mmjKsouxUHEvixQiySh%2F%2Fi9DvbHiyCOKAxgVP5lRMj59jhEDjgKF0QD3CvvcEpw7SxLYv5xVaGOejie6rMVK8J217nqIpUBMoA8MlfLBRY07setgo6cckaYg6sV4CHfFvxlcmY5trH7WAyuUSeTtSFiHUTjSjAt5gB1XzvOuLijWNBBqdrEUH%2BWsI37wcyr%2FQBK4eWUE%2BxiSKPdCBCVQxKrS%2BX7IKNhCgNWjp5deEqqBxQFzvPaWwJQJMOy%2B%2F%2Fz6ON3kXbTAo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA6RABXQZ6D4VCRVFK%2F20250926%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250926T162834Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=8a46c492b03fc478d19ebe77134e38380bd8dc48e6a2d93a6054860998161ac8",
        "after_url":  "https://fypwhere.s3.ap-southeast-2.amazonaws.com/eu_cookie_new.pdf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEAkaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAIJ4qBT%2BaWDllG%2Bj5ZobfKCDua15RZXJ6ZXu1q%2FFZnsqAiEAz2Ai3d52BF1N9PdiKsE1k4npjM0GrqPvYBQVlxZXVGkqvgMIkv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw5OTg1ODM1MzUyMjgiDFKqtkZwzOcCf5kGQSqSA7PUqvhuX5g4KFALmbFZpPu3rRfqGmv5Ahlv0yBttGfKFhzVPwdZ37xnHzQRbqWGjmO9GjgVoZ0ywe8mZsRR5jLuX0I9x6ymX3jV1R8ZnVAIZv3Nh4R6erGHvt1%2B%2BXJR3PH31VccT6gR1rEwgvPxirf2mc4EiGBOwV2Yj2m9goZ%2BZO%2BcCOI2iU1oAcLsBFje1Wfqfv4gKEjLS9lhXKZnj2AeNWo%2FDctF0KVSey9kc9P%2BqXkr%2B86yS2TF9JWG8VJzPEz35XUgWZflfGd%2BTqp0ltf6bvvFzoWyPlJ6wOADEFoBJ1Mz16TRJcJZNU5puSGOI%2FtYCrE6CRM50ATnY2Wr9emzEytQKSbLPaIhgTs7rNUFIj4pzifDGWpm6EzQzQZflzmCH2Wv7reTvjFBr25QAq9NS900u6ucrYEYEAEF3IYzVdT%2Bb2qr5zpmNgCj5JP8AfDARp%2Bsjw2qdd4P8ujRdQ3YDvqFi7XX7B0qtgznn3TJU719MqFX6NX9fJ1O0OLikZLT9b%2FLz8pLwUsZAg%2BwHdzHOTDV3dnGBjrdAvYlEo2ljjHrWKt9yGye571ys3u%2BzeysJBQqI9I7ADrb0YbsE4ax4BtCX1TrzfJ2bF%2FrzgUdVigZlgd2aE29WhbRcHS%2FFZpfiSioCSPTAZ5Jf6NLjUk%2F1u9WbNfcBcZNsF12UbebVHbRdv02QDrywYRArlcTwd6YnA39a19Hhbg5oE9JzyHIl69gsXY6%2FBa1YtSaH6Ow81mmjKsouxUHEvixQiySh%2F%2Fi9DvbHiyCOKAxgVP5lRMj59jhEDjgKF0QD3CvvcEpw7SxLYv5xVaGOejie6rMVK8J217nqIpUBMoA8MlfLBRY07setgo6cckaYg6sV4CHfFvxlcmY5trH7WAyuUSeTtSFiHUTjSjAt5gB1XzvOuLijWNBBqdrEUH%2BWsI37wcyr%2FQBK4eWUE%2BxiSKPdCBCVQxKrS%2BX7IKNhCgNWjp5deEqqBxQFzvPaWwJQJMOy%2B%2F%2Fz6ON3kXbTAo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA6RABXQZ6D4VCRVFK%2F20250926%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20250926T162904Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=c02a72f73c4b4fa24bc731e6b189826da3a67e7b0d503aa0655d5e1e392afd8c",
    })
    if isinstance(result, dict) and "text" in result and isinstance(result["text"], str):
        try:
            inner = json.loads(result["text"])
            print(json.dumps(inner, indent=2, ensure_ascii=False))
        except json.JSONDecodeError:
            print(result["text"])
    else:
        print(json.dumps(result, indent=2, ensure_ascii=False))


