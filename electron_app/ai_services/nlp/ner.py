from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic Models ---

class NEREntity(BaseModel):
    text: str
    label: str
    start_char: int
    end_char: int

class NERRequest(BaseModel):
    text: str
    recording_id: Optional[int] = None # Optional context

class NERResponse(BaseModel):
    entities: List[NEREntity]
    recording_id: Optional[int] = None

# --- FastAPI Router ---
router = APIRouter()

# --- Dummy Data for Simulation ---
# Sample text: "The patient underwent an ADOS assessment. Key treatment goal: שיפור יכולות תקשורת."
# Corresponding start/end chars need to be calculated if this text is used.
# For ADOS (start_char: 25, end_char: 29)
# For שיפור יכולות תקשורת (start_char: 61, end_char: 82) - assuming Hebrew characters are 1 byte for char count.
# Python's len() on strings gives character count, which is what we need for start/end_char.

dummy_ner_entities_map = {
    "default": [ # Default if no specific text match
        NEREntity(text="ADOS", label="DIAGNOSTIC_TOOL", start_char=25, end_char=29),
        NEREntity(text="שיפור יכולות תקשורת", label="TREATMENT_GOAL", start_char=61, end_char=82),
        NEREntity(text="PDD-NOS", label="DIAGNOSIS", start_char=100, end_char=107) # Example
    ],
    "Hello world, this is a test.": [ # From dummy_interim_results in transcription.py
        NEREntity(text="test", label="KEY_EVENT", start_char=24, end_char=28)
    ],
    "This is a dummy transcription from the AI service. It simulates a conversation. The patient underwent an ADOS assessment. Key treatment goal: שיפור יכולות תקשורת.": [
        NEREntity(text="ADOS", label="DIAGNOSTIC_TOOL", start_char=103, end_char=107),
        NEREntity(text="שיפור יכולות תקשורת", label="TREATMENT_GOAL", start_char=139, end_char=160),
    ]
}


@router.post("/ner", response_model=NERResponse)
async def extract_entities_placeholder(
    request: NERRequest = Body(...)
):
    """
    Placeholder for Named Entity Recognition (NER).
    Accepts text and returns a list of dummy NER entities.
    """
    print(f"AI Service (NLP): Received NER request for recording_id: {request.recording_id}")
    print(f"Text for NER: '{request.text[:100]}...'")

    # Select dummy entities based on input text, or use default
    selected_entities = dummy_ner_entities_map.get(request.text, dummy_ner_entities_map["default"])
    
    # Adjust start/end_char if the provided text is shorter than what entities expect
    # This is a very basic adjustment for placeholder
    final_entities = []
    for entity_data in selected_entities:
        if entity_data.start_char < len(request.text) and entity_data.end_char <= len(request.text):
            # Ensure the entity text actually matches the substring if we were doing real validation
            # extracted_text = request.text[entity_data.start_char:entity_data.end_char]
            # if extracted_text == entity_data.text:
            final_entities.append(entity_data)
        elif entity_data.start_char < len(request.text) and entity_data.end_char > len(request.text):
            # If entity goes beyond text length, try to adjust or skip
            # For simplicity, we just skip if it's out of bounds from the start
            pass 
            
    # If no specific match and default entities also don't fit, return empty or a generic one
    if not final_entities and request.text not in dummy_ner_entities_map:
        # Example: if text is too short for default entities
        if len(request.text) > 5: # Add a generic entity if text is not empty
             final_entities.append(NEREntity(text=request.text[:5], label="GENERIC_ENTITY", start_char=0, end_char=5))


    return NERResponse(entities=final_entities, recording_id=request.recording_id)
