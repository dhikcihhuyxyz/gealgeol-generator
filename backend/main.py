from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.video_generate import router as video_generate_router
from routers.access_gate import router as access_gate_router

app = FastAPI(
    title="Tools Ku API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Backend Vercel
        "https://gealgeol-generator-dhikcihhuy.vercel.app",

        # Frontend Vercel production / preview
        "https://gealgeol-generator.vercel.app",
        "https://gealgeol-generator-git-main-dhikcihuyzs-projects.vercel.app",
        "https://gealgeol-generator-dhikcihuyzs-projects.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|http://192\.168\.\d+\.\d+:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video_generate_router)
app.include_router(access_gate_router)


@app.get("/")
def root():
    return {
        "message": "Tools Ku API aktif"
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "ok",
        "message": "Backend aktif"
    }