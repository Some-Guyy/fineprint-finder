from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
import shutil
from pathlib import Path
# import chromadb

# # Connect to ChromaDB server (change host/port/ssl as needed)
# client = chromadb.HttpClient(
#     host="localhost",
#     port=8001,
#     ssl=False
# )

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "content_type": file.content_type, "location": str(file_path)}

# @app.get("/add")
# async def add_docs():
#     collection = client.get_or_create_collection(name="my_collection")
#     collection.add(
#         ids=["id1", "id2"],
#         documents=[
#             "This is a document about pineapple",
#             "This is a document about oranges"
#         ]
#     )
#     return PlainTextResponse("added docs", status_code=200)

# @app.get("/query")
# async def query_docs():
#     collection = client.get_or_create_collection(name="my_collection")
#     results = collection.query(
#         query_texts=["This is a query document about hawaii"],
#         n_results=2
#     )
#     print(results)
#     return JSONResponse(content=results, status_code=200)

# @app.get("/clear")
# async def clear_collections():
#     collections = client.list_collections()
#     for col in collections:
#         client.delete_collection(name=col.name)
#         print(f"Deleted collection: {col.name}")
#     return PlainTextResponse("Cleared collections!", status_code=200)

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(request: Request, path_name: str):
    print("Unhandled route:", request.url.path)
    return PlainTextResponse("Route not found", status_code=404)
