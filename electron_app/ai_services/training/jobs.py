from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import Dict
import uuid
import time

# --- Pydantic Models ---

class TrainingJobRequest(BaseModel):
    model_type: str # e.g., "speech", "language", "ner"

class TrainingJobStatus(BaseModel):
    job_id: str
    model_type: str
    status: str # e.g., "queued", "starting", "running", "completed", "failed"
    progress: float # 0.0 to 100.0
    message: str
    last_updated: float # timestamp

# --- In-memory Job Store ---
# Note: This is not persistent and will reset on server restart.
# For a real application, use a database or a more robust job queue.
training_jobs_db: Dict[str, TrainingJobStatus] = {}

# --- FastAPI Router ---
router = APIRouter()

@router.post("/start", response_model=TrainingJobStatus)
async def start_training_job(
    request: TrainingJobRequest = Body(...)
):
    """
    Starts a new dummy training job.
    """
    job_id = str(uuid.uuid4())
    current_time = time.time()

    initial_status = TrainingJobStatus(
        job_id=job_id,
        model_type=request.model_type,
        status="starting", # Start with "starting" to trigger progress simulation on first status check
        progress=0.0,
        message=f"Training job for {request.model_type} model initialized.",
        last_updated=current_time
    )
    training_jobs_db[job_id] = initial_status

    print(f"AI Service (Training): Started job {job_id} for model type {request.model_type}")
    return initial_status

@router.get("/status/{job_id}", response_model=TrainingJobStatus)
async def get_training_job_status(job_id: str):
    """
    Returns the status of a training job, simulating progress.
    """
    if job_id not in training_jobs_db:
        raise HTTPException(status_code=404, detail="Training job not found.")

    job = training_jobs_db[job_id]
    current_time = time.time()

    if job.status == "starting":
        job.status = "running"
        job.progress = 0.0 # Explicitly set to 0 when starting to run
        job.message = f"Job {job_id} ({job.model_type}) is now running."
    elif job.status == "running":
        # Simulate progress increment only if some time has passed (e.g., > 1 sec)
        # This is a very basic simulation.
        if current_time - job.last_updated > 1: # Avoid instant completion
            job.progress += 25.0 # Increment progress
            if job.progress >= 100.0:
                job.progress = 100.0
                job.status = "completed"
                job.message = f"Job {job_id} ({job.model_type}) completed successfully."
            else:
                job.message = f"Job {job_id} ({job.model_type}) is running, progress at {job.progress}%."
    # No changes for "completed" or "failed" statuses in this simulation

    job.last_updated = current_time
    training_jobs_db[job_id] = job # Update the store

    print(f"AI Service (Training): Status for job {job_id}: {job.status}, Progress: {job.progress}%")
    return job
