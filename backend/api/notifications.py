from fastapi import APIRouter, HTTPException, Body
from bson import ObjectId
import logging

from db.mongo import notification_collection

router = APIRouter(prefix="/notifications", tags=["notifications"])

# get all notifications for specific user 
@router.get("/")
async def get_notifications(username: str):
    try:
        cursor = notification_collection.find().sort("created_at", -1)
        notifications = []
        for doc in cursor:
            notifications.append({
                "id": str(doc["_id"]),
                "title": doc["title"],
                "message": doc["message"],
                "seen": username in doc.get("seen_by", []),
                "created_at": doc["created_at"].strftime("%Y-%m-%d %H:%M"),
            })
        return notifications
    except Exception as e:
        logging.exception("Failed to fetch notifications")
        raise HTTPException(status_code=500, detail=str(e))

# mark notification as seen
@router.put("/{notif_id}/seen")
async def mark_as_seen(notif_id: str, body: dict = Body(...)):
    try:
        username = body.get("username")
        if not username:
            raise HTTPException(status_code=400, detail="Missing 'username' field")
        
        notif = notification_collection.find_one({"_id": ObjectId(notif_id)})
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")

        notification_collection.update_one(
            {"_id": ObjectId(notif_id)},
            {"$addToSet": {"seen_by": username}}
        )

        return {"message": f"{username} marked notification as seen"}
    except Exception as e:
        logging.exception("Failed to mark notification as seen")
        raise HTTPException(status_code=500, detail=str(e))
