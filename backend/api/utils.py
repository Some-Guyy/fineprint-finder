from fastapi import APIRouter, Request
from fastapi.responses import PlainTextResponse

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(request: Request, path_name: str):
    print("Unhandled route:", request.url.path)
    return PlainTextResponse(f"Route /{path_name} not found", status_code=404)
