"""Gemini AI service helpers for Smart Bharat (chat, service simplifier, vision analysis)."""
import json
import logging
import os
from typing import AsyncGenerator, Dict, List, Optional

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from emergentintegrations.llm.chat import (  # noqa: E402
    LlmChat,
    UserMessage,
    ImageContent,
    TextDelta,
    StreamDone,
)

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = "gemini-3-flash-preview"
PROVIDER = "gemini"


def _chat_system_message(language: str) -> str:
    lang_instruction = (
        "Respond ONLY in Hindi (Devanagari script). Keep technical terms like PAN, Aadhaar in English."
        if language == "hi"
        else "Respond in clear, simple English."
    )
    return (
        "You are Smart Bharat's Civic AI Companion - a friendly, knowledgeable assistant for Indian citizens. "
        "You help with: government services (PAN, Aadhaar, Passport, Voter ID, Driving License, Ration Card), "
        "subsidies and welfare schemes (PM-KISAN, Ayushman Bharat, state schemes), civic issues, and bureaucratic processes. "
        "Rules: 1) Be concise and actionable - use short bullet points and numbered steps. "
        "2) Mention official portal names/URLs when relevant. "
        "3) Simplify bureaucratic language into plain words. "
        "4) If a question is not about Indian civic/government topics, politely redirect to civic topics. "
        f"5) {lang_instruction}"
    )


async def stream_chat_response(
    session_id: str,
    message: str,
    language: str,
    history: Optional[List[Dict]] = None,
) -> AsyncGenerator[Dict, None]:
    """Stream a chat response from Gemini. Yields dicts: {type: 'delta', text} then {type: 'done', content}."""
    initial_messages = [{"role": "system", "content": _chat_system_message(language)}]
    for m in (history or [])[-12:]:
        role = m.get("role")
        if role in ("user", "assistant") and m.get("content"):
            initial_messages.append({"role": role, "content": m["content"]})

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=session_id,
        system_message=_chat_system_message(language),
        initial_messages=initial_messages,
    ).with_model(PROVIDER, MODEL)

    full_text = ""
    async for event in chat.stream_message(UserMessage(text=message)):
        if isinstance(event, TextDelta):
            full_text += event.content
            yield {"type": "delta", "text": event.content}
        elif isinstance(event, StreamDone):
            break
    yield {"type": "done", "content": full_text}


def _strip_json_fences(raw: str) -> str:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        if len(parts) >= 2:
            cleaned = parts[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    # Fallback: grab substring between first { and last }
    if not cleaned.strip().startswith("{"):
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start : end + 1]
    return cleaned.strip()


async def generate_service_summary(service_name: str, service_description: str, language: str) -> Dict:
    """Generate a simplified 3-section summary for a government service. Returns dict."""
    lang_note = (
        "All string values MUST be in Hindi (Devanagari script), keeping terms like PAN/Aadhaar in English."
        if language == "hi"
        else "All string values MUST be in simple, plain English."
    )
    system = (
        "You are an expert on Indian government services who simplifies complex bureaucratic requirements for ordinary citizens. "
        "Respond ONLY with valid JSON (no markdown fences) matching exactly this schema: "
        '{"eligibility": [array of 3-5 short strings - who is eligible], '
        '"documents": [array of 3-6 short strings - documents needed], '
        '"time_cost": {"estimated_time": string, "cost": string, "notes": string (one short tip)}} '
        + lang_note
    )
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=f"simplify-{service_name}-{language}",
        system_message=system,
    ).with_model(PROVIDER, MODEL)

    resp = await chat.send_message(
        UserMessage(
            text=(
                f"Simplify the requirements for this Indian government service: '{service_name}' ({service_description}). "
                "Return the JSON only."
            )
        )
    )
    data = json.loads(_strip_json_fences(resp))
    # basic validation
    if not all(k in data for k in ("eligibility", "documents", "time_cost")):
        raise ValueError("Missing keys in service summary JSON")
    return data


async def analyze_issue_image(image_b64: str) -> Dict:
    """Analyze a civic issue image with Gemini vision. Returns categorization dict."""
    system = (
        "You are a civic issue image analyzer for Indian cities. Analyze the image and categorize the civic issue. "
        "Respond ONLY with valid JSON, no markdown fences, matching exactly this schema: "
        '{"category": one of ["pothole","water_leakage","garbage_waste","broken_streetlight","damaged_road","sewage_drainage","stray_animals","other"], '
        '"severity": one of ["low","medium","high"], '
        '"short_description": string (max 20 words describing what you see), '
        '"confidence": number between 0 and 1}. '
        'If the image does not show a civic issue, use category "other" with low confidence.'
    )
    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id="vision-analyze",
        system_message=system,
    ).with_model(PROVIDER, MODEL)

    resp = await chat.send_message(
        UserMessage(
            text="Analyze this civic issue image and return the JSON.",
            file_contents=[ImageContent(image_base64=image_b64)],
        )
    )
    data = json.loads(_strip_json_fences(resp))
    if "category" not in data:
        raise ValueError("Missing category in vision JSON")
    data.setdefault("severity", "medium")
    data.setdefault("short_description", "")
    data.setdefault("confidence", 0.5)
    return data
