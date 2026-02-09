import os
from dotenv import load_dotenv
from fastapi import FastAPI, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from openai import OpenAI, APIError, RateLimitError, AuthenticationError

load_dotenv()

app = FastAPI()

# Initialize OpenAI client (None if no key configured)
_openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client: Optional[OpenAI] = None
if _openai_api_key and _openai_api_key != "your-openai-api-key-here":
    openai_client = OpenAI(api_key=_openai_api_key)
    print("OpenAI client initialized successfully.")
else:
    print("WARNING: OPENAI_API_KEY not set. Summarization will use local fallback.")

# Sample GET endpoint
@app.get("/status")
async def get_status():
  return {"status": "AI services are running"}

# Dummy Transcription Model
class TranscriptionSegment(BaseModel):
    speaker: str
    startTime: float # Using float for time in seconds
    endTime: float
    text: str

class TranscriptionResponse(BaseModel):
    transcription: str
    segments: List[TranscriptionSegment]

# AI Service Placeholder Endpoint for Transcription
@app.post("/ai/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    recording_id: Optional[int] = Body(None), # Can be part of the request body
    dummy_data: Optional[str] = Body(None) # Placeholder for actual audio data or path
):
  """
  Placeholder endpoint for AI transcription.
  Receives a recording ID (optional) and dummy data.
  Returns a hardcoded dummy transcription.
  """
  print(f"AI Service: Received transcription request for recording_id: {recording_id}, data: {dummy_data}")

  # Hardcoded dummy transcription
  dummy_transcription = "This is a dummy transcription from the AI service. It simulates a conversation."
  dummy_segments = [
    {"speaker": "SPEAKER_00", "startTime": 0.5, "endTime": 4.8, "text": "Hello, this is a dummy transcription segment."},
    {"speaker": "SPEAKER_01", "startTime": 5.2, "endTime": 9.3, "text": "And this is another segment from a different speaker."}
  ]

  # Simulate some processing time
  # import asyncio
  # await asyncio.sleep(2)

  return {
    "transcription": dummy_transcription,
    "segments": dummy_segments
  }

# Pydantic model for Summarization
class SummarizationRequest(BaseModel):
    recording_id: Optional[int] = None
    transcription_text: str

class SummarizationResponse(BaseModel):
    recording_id: Optional[int]
    summary: str

def _generate_local_fallback_summary(recording_id: Optional[int], transcription_text: str) -> str:
  """Generate a basic local summary when OpenAI is unavailable."""
  word_count = len(transcription_text.split())
  preview = transcription_text[:200].strip()
  return (
    f"[Local fallback summary for recording ID {recording_id}] "
    f"The session transcription contains {word_count} words. "
    f"Preview: \"{preview}...\" "
    "Note: For a full AI-generated summary, ensure your OpenAI API key is configured and has available credits."
  )


# AI Service Endpoint for Summarization (OpenAI with fallback)
@app.post("/ai/summarize", response_model=SummarizationResponse)
async def summarize_text(
    request_data: SummarizationRequest = Body(...)
):
  """
  Summarizes transcription text using OpenAI GPT.
  Falls back to a local summary if OpenAI credits are exhausted or the key is not configured.
  """
  print(f"AI Service: Received summarization request for recording_id: {request_data.recording_id}")
  print(f"Transcription text received: '{request_data.transcription_text[:100]}...'")

  # Try OpenAI summarization
  if openai_client:
    try:
      response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
          {
            "role": "system",
            "content": (
              "You are a professional speech therapy session summarizer. "
              "Summarize the following therapy session transcription concisely. "
              "Include key topics discussed, patient progress observations, "
              "and any action items or follow-ups mentioned. "
              "Write the summary in the same language as the transcription."
            )
          },
          {
            "role": "user",
            "content": request_data.transcription_text
          }
        ],
        max_tokens=1024,
        temperature=0.3,
      )
      summary = response.choices[0].message.content
      print(f"OpenAI summary generated for recording ID: {request_data.recording_id}")
      return {
        "recording_id": request_data.recording_id,
        "summary": summary
      }
    except RateLimitError as e:
      print(f"OpenAI rate limit / credits exhausted: {e}. Falling back to local summary.")
    except AuthenticationError as e:
      print(f"OpenAI authentication failed: {e}. Falling back to local summary.")
    except APIError as e:
      print(f"OpenAI API error: {e}. Falling back to local summary.")
    except Exception as e:
      print(f"Unexpected error calling OpenAI: {e}. Falling back to local summary.")

  # Fallback: local summary when OpenAI is unavailable or credits are exhausted
  fallback_summary = _generate_local_fallback_summary(
    request_data.recording_id, request_data.transcription_text
  )
  return {
    "recording_id": request_data.recording_id,
    "summary": fallback_summary
  }

# Placeholder for including routers from sub-services
from .speech import transcription as speech_transcription_router
from .nlp import ner as nlp_ner_router
from .nlp import search as nlp_search_router
from .training import jobs as training_jobs_router # Import the new Training router

app.include_router(speech_transcription_router.router, prefix="/speech", tags=["speech"])
app.include_router(nlp_ner_router.router, prefix="/nlp", tags=["nlp"])
app.include_router(nlp_search_router.router, prefix="/nlp", tags=["nlp"])
app.include_router(training_jobs_router.router, prefix="/training", tags=["training"]) # Include the Training router


class TranscriptionRequest(BaseModel):
    recording_id: Optional[int] = None
    dummy_data: Optional[str] = None


if __name__ == "__main__":
  import uvicorn
  # Ensure to run with reload in dev for changes to take effect, but not in this script directly
  uvicorn.run(app, host="0.0.0.0", port=8000)
