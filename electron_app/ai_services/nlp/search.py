from fastapi import APIRouter, Body, Query
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic Models ---

class SearchResultItem(BaseModel):
    id: str
    type: str  # e.g., "patient", "document", "recording_segment"
    title: str # Display title for the result
    score: float # Relevance score
    # Optional: snippet: Optional[str] = None # A small snippet of text if applicable

class SearchRequest(BaseModel): # If using POST for search query
    query: str
    top_k: Optional[int] = 5

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query_received: str # For confirmation

# --- FastAPI Router ---
router = APIRouter()

# --- Dummy Data for Simulation ---
dummy_search_results_db = {
    "ados": [
        SearchResultItem(id="doc-456", type="document", title="ADOS Report Summary for Patient X", score=0.88),
        SearchResultItem(id="patient-123", type="patient", title="Patient John Doe (mentioned ADOS)", score=0.75),
        SearchResultItem(id="recording-seg-001", type="recording_segment", title="Segment: '...ADOS assessment was conducted...'", score=0.92),
    ],
    "communication": [
        SearchResultItem(id="goal-001", type="treatment_goal", title="Goal: Improve communication skills for Jane Doe", score=0.95),
        SearchResultItem(id="patient-789", type="patient", title="Patient Jane Doe (focus on communication)", score=0.82),
        SearchResultItem(id="protocol-002", type="protocol", title="Protocol: Social Communication Enhancement", score=0.70),
    ],
    "default": [
        SearchResultItem(id="patient-generic", type="patient", title="Generic Patient Record", score=0.65),
        SearchResultItem(id="doc-generic", type="document", title="Standard Procedure Document", score=0.55),
    ]
}

@router.post("/semantic_search", response_model=SearchResponse)
async def semantic_search_placeholder(
    request: SearchRequest = Body(...)
):
    """
    Placeholder for semantic search.
    Accepts a search query and returns a list of dummy search results.
    """
    query_lower = request.query.lower()
    print(f"AI Service (NLP Search): Received semantic search request for query: '{request.query}'")

    results = []
    found = False
    for keyword, res_list in dummy_search_results_db.items():
        if keyword in query_lower:
            results.extend(res_list)
            found = True

    if not found:
        results.extend(dummy_search_results_db["default"])

    # Sort by score for better presentation (descending)
    results.sort(key=lambda x: x.score, reverse=True)

    return SearchResponse(results=results[:request.top_k], query_received=request.query)

# Alternative: GET endpoint if query is simple enough (less common for "semantic" search usually)
@router.get("/semantic_search_get", response_model=SearchResponse)
async def semantic_search_get_placeholder(
    query: str = Query(..., min_length=1),
    top_k: Optional[int] = Query(5)
):
    """
    Placeholder for semantic search using GET.
    Accepts a search query and returns a list of dummy search results.
    """
    query_lower = query.lower()
    print(f"AI Service (NLP Search): Received GET semantic search request for query: '{query}'")

    results = []
    found = False
    for keyword, res_list in dummy_search_results_db.items():
        if keyword in query_lower:
            results.extend(res_list)
            found = True

    if not found:
        results.extend(dummy_search_results_db["default"])

    results.sort(key=lambda x: x.score, reverse=True)

    return SearchResponse(results=results[:top_k], query_received=query)
