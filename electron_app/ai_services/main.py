from fastapi import FastAPI

app = FastAPI()

# Sample GET endpoint
@app.get("/status")
async def get_status():
  return {"status": "AI services are running"}

# Placeholder for including routers from sub-services
# from .speech import router as speech_router
# from .nlp import router as nlp_router

# app.include_router(speech_router, prefix="/speech", tags=["speech"])
# app.include_router(nlp_router, prefix="/nlp", tags=["nlp"])

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=8000)
