from fastapi import FastAPI
from app.api.router import api_router

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego restringís
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app = FastAPI(
    title="Space MMO",
    version="0.1.0"
)

app.include_router(api_router)

@app.get("/")
def root():
    return {"status": "Space MMO backend online"}
