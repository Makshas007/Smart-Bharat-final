"""
Smart Bharat - Core POC Script
Tests (all in one file):
1. Gemini text generation - civic Q&A in English (user's own key)
2. Gemini text generation - civic Q&A in Hindi
3. Gemini vision - civic issue image categorization with strict JSON output
"""
import asyncio
import base64
import json
import os
import sys

from dotenv import load_dotenv

load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3-flash-preview"

results = {}


async def test_text_english():
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id="poc-en",
        system_message="You are Smart Bharat's Civic AI Companion, an expert on Indian government services. Answer clearly and concisely in English.",
    ).with_model("gemini", MODEL)
    resp = await chat.send_message(UserMessage(text="How do I apply for a PAN card? Answer in 3 short bullet points."))
    print("\n=== TEST 1: English civic Q&A ===")
    print(resp[:500])
    assert resp and len(resp) > 50, "English response too short"
    results["text_en"] = "PASS"


async def test_text_hindi():
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id="poc-hi",
        system_message="You are Smart Bharat's Civic AI Companion, an expert on Indian government services. Answer ONLY in Hindi (Devanagari script).",
    ).with_model("gemini", MODEL)
    resp = await chat.send_message(UserMessage(text="Voter ID kaise banaye? 3 short points me batao."))
    print("\n=== TEST 2: Hindi civic Q&A ===")
    print(resp[:500])
    # Check Devanagari characters present
    has_devanagari = any("\u0900" <= ch <= "\u097F" for ch in resp)
    assert has_devanagari, "Response does not contain Hindi (Devanagari)"
    results["text_hi"] = "PASS"


async def test_vision_json():
    with open("/tmp/pothole.jpg", "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id="poc-vision",
        system_message=(
            "You are a civic issue image analyzer for Indian cities. Analyze the image and categorize the civic issue. "
            "Respond ONLY with valid JSON, no markdown fences, matching exactly this schema: "
            '{"category": one of ["pothole","water_leakage","garbage_waste","broken_streetlight","damaged_road","other"], '
            '"severity": one of ["low","medium","high"], '
            '"short_description": string (max 20 words), '
            '"confidence": number between 0 and 1}'
        ),
    ).with_model("gemini", MODEL)

    resp = await chat.send_message(
        UserMessage(
            text="Analyze this civic issue image and return the JSON.",
            file_contents=[ImageContent(image_base64=img_b64)],
        )
    )
    print("\n=== TEST 3: Vision categorization (strict JSON) ===")
    print(resp[:500])
    cleaned = resp.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    data = json.loads(cleaned)
    assert "category" in data and "severity" in data and "short_description" in data, "Missing JSON keys"
    print("Parsed:", data)
    results["vision_json"] = "PASS"


async def main():
    failed = False
    for name, fn in [
        ("text_en", test_text_english),
        ("text_hi", test_text_hindi),
        ("vision_json", test_vision_json),
    ]:
        try:
            await fn()
        except Exception as e:
            results[name] = f"FAIL: {type(e).__name__}: {e}"
            failed = True

    print("\n========== POC RESULTS ==========")
    for k, v in results.items():
        print(f"{k}: {v}")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    asyncio.run(main())
