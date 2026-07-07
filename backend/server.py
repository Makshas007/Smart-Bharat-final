from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import base64
import random
import string
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

import gemini_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Uploads directory (served statically)
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Smart Bharat API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Services catalog (static; AI summaries generated + cached on demand)
# ---------------------------------------------------------------------------
SERVICES_CATALOG = [
    {
        "key": "aadhaar-update",
        "name": "Aadhaar Update",
        "name_hi": "\u0906\u0927\u093e\u0930 \u0905\u092a\u0921\u0947\u091f",
        "description": "Update your name, address, mobile number or photo on your Aadhaar card.",
        "description_hi": "\u0905\u092a\u0928\u0947 \u0906\u0927\u093e\u0930 \u0915\u093e\u0930\u094d\u0921 \u092e\u0947\u0902 \u0928\u093e\u092e, \u092a\u0924\u093e, \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u092f\u093e \u092b\u094b\u091f\u094b \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902\u0964",
        "icon": "fingerprint",
        "badges": ["Popular", "Online"],
        "apply_url": "https://myaadhaar.uidai.gov.in/",
    },
    {
        "key": "pan-card",
        "name": "PAN Card Application",
        "name_hi": "\u092a\u0948\u0928 \u0915\u093e\u0930\u094d\u0921 \u0906\u0935\u0947\u0926\u0928",
        "description": "Apply for a new PAN card or make corrections to an existing one.",
        "description_hi": "\u0928\u090f \u092a\u0948\u0928 \u0915\u093e\u0930\u094d\u0921 \u0915\u0947 \u0932\u093f\u090f \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902 \u092f\u093e \u092e\u094c\u091c\u0942\u0926\u093e \u092e\u0947\u0902 \u0938\u0941\u0927\u093e\u0930 \u0915\u0930\u0947\u0902\u0964",
        "icon": "credit-card",
        "badges": ["Popular", "Online"],
        "apply_url": "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    },
    {
        "key": "passport-renewal",
        "name": "Passport Renewal",
        "name_hi": "\u092a\u093e\u0938\u092a\u094b\u0930\u094d\u091f \u0928\u0935\u0940\u0928\u0940\u0915\u0930\u0923",
        "description": "Renew your expired or expiring Indian passport online.",
        "description_hi": "\u0905\u092a\u0928\u093e \u0938\u092e\u093e\u092a\u094d\u0924 \u092f\u093e \u0938\u092e\u093e\u092a\u094d\u0924 \u0939\u094b \u0930\u0939\u093e \u092d\u093e\u0930\u0924\u0940\u092f \u092a\u093e\u0938\u092a\u094b\u0930\u094d\u091f \u0911\u0928\u0932\u093e\u0907\u0928 \u0928\u0935\u0940\u0928\u0940\u0915\u0943\u0924 \u0915\u0930\u0947\u0902\u0964",
        "icon": "plane",
        "badges": ["Online", "Appointment"],
        "apply_url": "https://www.passportindia.gov.in/",
    },
    {
        "key": "voter-id",
        "name": "Voter ID Registration",
        "name_hi": "\u0935\u094b\u091f\u0930 \u0906\u0908\u0921\u0940 \u092a\u0902\u091c\u0940\u0915\u0930\u0923",
        "description": "Register as a new voter or update your voter ID details.",
        "description_hi": "\u0928\u090f \u092e\u0924\u0926\u093e\u0924\u093e \u0915\u0947 \u0930\u0942\u092a \u092e\u0947\u0902 \u092a\u0902\u091c\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902 \u092f\u093e \u0935\u094b\u091f\u0930 \u0906\u0908\u0921\u0940 \u0935\u093f\u0935\u0930\u0923 \u0905\u092a\u0921\u0947\u091f \u0915\u0930\u0947\u0902\u0964",
        "icon": "vote",
        "badges": ["Popular", "Free"],
        "apply_url": "https://voters.eci.gov.in/",
    },
    {
        "key": "driving-license",
        "name": "Driving License",
        "name_hi": "\u0921\u094d\u0930\u093e\u0907\u0935\u093f\u0902\u0917 \u0932\u093e\u0907\u0938\u0947\u0902\u0938",
        "description": "Apply for a learner's or permanent driving license.",
        "description_hi": "\u0932\u0930\u094d\u0928\u0930 \u092f\u093e \u0938\u094d\u0925\u093e\u092f\u0940 \u0921\u094d\u0930\u093e\u0907\u0935\u093f\u0902\u0917 \u0932\u093e\u0907\u0938\u0947\u0902\u0938 \u0915\u0947 \u0932\u093f\u090f \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902\u0964",
        "icon": "car",
        "badges": ["Online", "Test Required"],
        "apply_url": "https://parivahan.gov.in/",
    },
    {
        "key": "ration-card",
        "name": "Ration Card",
        "name_hi": "\u0930\u093e\u0936\u0928 \u0915\u093e\u0930\u094d\u0921",
        "description": "Apply for a ration card to access subsidized food grains.",
        "description_hi": "\u0938\u092c\u094d\u0938\u093f\u0921\u0940 \u0935\u093e\u0932\u0947 \u0916\u093e\u0926\u094d\u092f\u093e\u0928\u094d\u0928 \u0915\u0947 \u0932\u093f\u090f \u0930\u093e\u0936\u0928 \u0915\u093e\u0930\u094d\u0921 \u0915\u093e \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902\u0964",
        "icon": "wheat",
        "badges": ["Welfare", "State-wise"],
        "apply_url": "https://nfsa.gov.in/",
    },
    {
        "key": "ayushman-bharat",
        "name": "Ayushman Bharat Card",
        "name_hi": "\u0906\u092f\u0941\u0937\u094d\u092e\u093e\u0928 \u092d\u093e\u0930\u0924 \u0915\u093e\u0930\u094d\u0921",
        "description": "Get free health insurance coverage up to Rs. 5 lakh per family per year.",
        "description_hi": "\u092a\u094d\u0930\u0924\u093f \u092a\u0930\u093f\u0935\u093e\u0930 \u092a\u094d\u0930\u0924\u093f \u0935\u0930\u094d\u0937 5 \u0932\u093e\u0916 \u0930\u0941\u092a\u092f\u0947 \u0924\u0915 \u092e\u0941\u092b\u094d\u0924 \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u092c\u0940\u092e\u093e \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0915\u0930\u0947\u0902\u0964",
        "icon": "heart-pulse",
        "badges": ["Free", "Health"],
        "apply_url": "https://beneficiary.nha.gov.in/",
    },
    {
        "key": "pm-kisan",
        "name": "PM-KISAN Scheme",
        "name_hi": "\u092a\u0940\u090f\u092e-\u0915\u093f\u0938\u093e\u0928 \u092f\u094b\u091c\u0928\u093e",
        "description": "Income support of Rs. 6000 per year for eligible farmer families.",
        "description_hi": "\u092a\u093e\u0924\u094d\u0930 \u0915\u093f\u0938\u093e\u0928 \u092a\u0930\u093f\u0935\u093e\u0930\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u092a\u094d\u0930\u0924\u093f \u0935\u0930\u094d\u0937 6000 \u0930\u0941\u092a\u092f\u0947 \u0915\u0940 \u0906\u092f \u0938\u0939\u093e\u092f\u0924\u093e\u0964",
        "icon": "tractor",
        "badges": ["Farmers", "Subsidy"],
        "apply_url": "https://pmkisan.gov.in/",
    },
]

ISSUE_CATEGORIES = {
    "pothole": {"label": "Pothole", "label_hi": "\u0917\u0921\u094d\u0922\u093e"},
    "water_leakage": {"label": "Water Leakage", "label_hi": "\u092a\u093e\u0928\u0940 \u0915\u093e \u0930\u093f\u0938\u093e\u0935"},
    "garbage_waste": {"label": "Garbage / Waste", "label_hi": "\u0915\u091a\u0930\u093e"},
    "broken_streetlight": {"label": "Broken Streetlight", "label_hi": "\u0916\u0930\u093e\u092c \u0938\u094d\u091f\u094d\u0930\u0940\u091f\u0932\u093e\u0907\u091f"},
    "damaged_road": {"label": "Damaged Road", "label_hi": "\u0915\u094d\u0937\u0924\u093f\u0917\u094d\u0930\u0938\u094d\u0924 \u0938\u0921\u093c\u0915"},
    "sewage_drainage": {"label": "Sewage / Drainage", "label_hi": "\u0938\u0940\u0935\u0930 / \u091c\u0932 \u0928\u093f\u0915\u093e\u0938"},
    "stray_animals": {"label": "Stray Animals", "label_hi": "\u0906\u0935\u093e\u0930\u093e \u092a\u0936\u0941"},
    "other": {"label": "Other", "label_hi": "\u0905\u0928\u094d\u092f"},
}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ChatSendRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"  # 'en' | 'hi'


class SimplifyRequest(BaseModel):
    service_key: str
    language: str = "en"


class IssueCreateRequest(BaseModel):
    category: str
    severity: str = "medium"
    description: str = ""
    location: str
    image_url: Optional[str] = None
    ai_analysis: Optional[dict] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def generate_tracking_id() -> str:
    for _ in range(10):
        tid = "SB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        existing = await db.issues.find_one({"tracking_id": tid})
        if not existing:
            return tid
    return "SB-" + uuid.uuid4().hex[:8].upper()


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Smart Bharat API is running", "status": "ok"}


# ---------------------------------------------------------------------------
# Chat endpoints
# ---------------------------------------------------------------------------
@api_router.post("/chat/send")
async def chat_send(req: ChatSendRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if req.language not in ("en", "hi"):
        req.language = "en"

    session = await db.chat_sessions.find_one({"session_id": req.session_id}, {"_id": 0})
    history = session.get("messages", []) if session else []

    user_msg = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": req.message,
        "timestamp": now_iso(),
    }

    async def event_generator():
        full_content = ""
        try:
            async for chunk in gemini_service.stream_chat_response(
                req.session_id, req.message, req.language, history
            ):
                if chunk["type"] == "delta":
                    yield f"data: {json.dumps({'type': 'delta', 'text': chunk['text']})}\n\n"
                elif chunk["type"] == "done":
                    full_content = chunk["content"]
            assistant_msg = {
                "id": str(uuid.uuid4()),
                "role": "assistant",
                "content": full_content,
                "timestamp": now_iso(),
            }
            await db.chat_sessions.update_one(
                {"session_id": req.session_id},
                {
                    "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
                    "$set": {"language": req.language, "updated_at": now_iso()},
                    "$setOnInsert": {"created_at": now_iso()},
                },
                upsert=True,
            )
            yield f"data: {json.dumps({'type': 'done', 'message': assistant_msg})}\n\n"
        except Exception as e:
            logger.exception("Chat streaming failed")
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@api_router.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    session = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        return {"session_id": session_id, "messages": [], "language": "en"}
    return session


# ---------------------------------------------------------------------------
# Services endpoints
# ---------------------------------------------------------------------------
@api_router.get("/services")
async def list_services():
    return {"services": SERVICES_CATALOG}


@api_router.post("/services/simplify")
async def simplify_service(req: SimplifyRequest):
    service = next((s for s in SERVICES_CATALOG if s["key"] == req.service_key), None)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    language = req.language if req.language in ("en", "hi") else "en"

    cached = await db.service_summaries.find_one(
        {"service_key": req.service_key, "language": language}, {"_id": 0}
    )
    if cached:
        return {"service": service, "summary": cached["summary"], "cached": True}

    try:
        summary = await gemini_service.generate_service_summary(
            service["name"], service["description"], language
        )
    except Exception as e:
        logger.exception("Service summary generation failed")
        raise HTTPException(status_code=502, detail=f"AI summary generation failed: {e}")

    await db.service_summaries.update_one(
        {"service_key": req.service_key, "language": language},
        {"$set": {"summary": summary, "updated_at": now_iso()}},
        upsert=True,
    )
    return {"service": service, "summary": summary, "cached": False}


# ---------------------------------------------------------------------------
# Issues endpoints
# ---------------------------------------------------------------------------
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024


@api_router.post("/issues/analyze-image")
async def analyze_issue_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WebP images are allowed")
    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 8 MB)")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Save file for later reference
    ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[file.content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    (UPLOADS_DIR / filename).write_bytes(contents)
    image_url = f"/api/uploads/{filename}"

    try:
        img_b64 = base64.b64encode(contents).decode()
        analysis = await gemini_service.analyze_issue_image(img_b64)
    except Exception as e:
        logger.exception("Image analysis failed")
        raise HTTPException(status_code=502, detail=f"AI image analysis failed: {e}")

    cat_info = ISSUE_CATEGORIES.get(analysis.get("category", "other"), ISSUE_CATEGORIES["other"])
    return {
        "image_url": image_url,
        "analysis": analysis,
        "category_label": cat_info["label"],
        "category_label_hi": cat_info["label_hi"],
    }


@api_router.post("/issues/create")
async def create_issue(req: IssueCreateRequest):
    if not req.location.strip():
        raise HTTPException(status_code=400, detail="Location is required")
    if req.category not in ISSUE_CATEGORIES:
        req.category = "other"

    tracking_id = await generate_tracking_id()
    created_at = now_iso()
    issue = {
        "id": str(uuid.uuid4()),
        "tracking_id": tracking_id,
        "category": req.category,
        "category_label": ISSUE_CATEGORIES[req.category]["label"],
        "category_label_hi": ISSUE_CATEGORIES[req.category]["label_hi"],
        "severity": req.severity if req.severity in ("low", "medium", "high") else "medium",
        "description": req.description,
        "location": req.location,
        "image_url": req.image_url,
        "ai_analysis": req.ai_analysis,
        "status": "submitted",
        "timeline": [
            {
                "stage": "submitted",
                "label": "Submitted",
                "label_hi": "\u091c\u092e\u093e \u0915\u093f\u092f\u093e \u0917\u092f\u093e",
                "completed": True,
                "timestamp": created_at,
                "note": "Your report has been received and assigned a tracking ID.",
            },
            {
                "stage": "in_review",
                "label": "In Review",
                "label_hi": "\u0938\u092e\u0940\u0915\u094d\u0937\u093e \u092e\u0947\u0902",
                "completed": False,
                "timestamp": None,
                "note": "The municipal team will verify and assign your report.",
            },
            {
                "stage": "resolved",
                "label": "Resolved",
                "label_hi": "\u0938\u092e\u093e\u0927\u093e\u0928 \u0939\u094b \u0917\u092f\u093e",
                "completed": False,
                "timestamp": None,
                "note": "The issue will be fixed and marked as resolved.",
            },
        ],
        "created_at": created_at,
    }
    await db.issues.insert_one({**issue})
    return {"tracking_id": tracking_id, "issue": issue}


@api_router.get("/issues/recent")
async def recent_issues():
    issues = (
        await db.issues.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(12)
    )
    return {"issues": issues}


@api_router.get("/issues/{tracking_id}")
async def get_issue(tracking_id: str):
    issue = await db.issues.find_one({"tracking_id": tracking_id.strip().upper()}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="No issue found with this tracking ID")
    return issue


@api_router.get("/issues/categories/all")
async def issue_categories():
    return {"categories": [{"key": k, **v} for k, v in ISSUE_CATEGORIES.items()]}


# Include router + static uploads
app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
