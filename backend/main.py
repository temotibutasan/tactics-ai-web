from dotenv import load_dotenv
load_dotenv() # .env ファイルから環境変数を読み込む
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import random
from google import genai

app = FastAPI(title="TacticsAI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Geminiクライアントの初期化（環境変数から設定）
# ※本番では環境変数 (GEMINI_API_KEY) に設定することを推奨します
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("警告: GEMINI_API_KEY 環境変数が設定されていません。")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
class TacticsRequest(BaseModel):
    tracking_summary: str

@app.get("/")
def read_root():
    return {"message": "TacticsAI Backend is running successfully!"}

@app.post("/api/track-video")
async def track_video(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    frames_data = []
    for frame_id in range(30):
        frame_players = [
            {"id": 1, "team": "home", "x": 50 + random.randint(-5, 5), "y": 85 + random.randint(-5, 5), "number": 1},
            {"id": 2, "team": "home", "x": 30 + random.randint(-5, 5), "y": 65 + random.randint(-5, 5), "number": 2},
            {"id": 3, "team": "home", "x": 70 + random.randint(-5, 5), "y": 65 + random.randint(-5, 5), "number": 3},
            {"id": 4, "team": "away", "x": 50 + random.randint(-5, 5), "y": 15 + random.randint(-5, 5), "number": 1},
            {"id": 5, "team": "away", "x": 35 + random.randint(-5, 5), "y": 30 + random.randint(-5, 5), "number": 5},
        ]
        ball_pos = {"x": 50 + random.randint(-10, 10), "y": 40 + random.randint(-10, 10)}
        
        frames_data.append({
            "frame": frame_id,
            "players": frame_players,
            "ball": ball_pos
        })

    return {
        "status": "success",
        "filename": file.filename,
        "total_frames": len(frames_data),
        "tracking_data": frames_data
    }

@app.post("/api/analyze-tactics")
async def analyze_tactics(data: TacticsRequest):
    """
    トラッキングデータをもとに、Gemini AIに戦術分析を行わせる
    """
    if not client:
        raise HTTPException(status_code=500, detail="Gemini APIキーが設定されていません。")

    prompt = f"""
    あなたはプロサッカーの戦術アナリストです。以下の選手のトラッキング・フォーメーション状況を分析し、
    1. チームのコンパクト性（陣形の崩れや隙）
    2. 相手守備ブロックの弱点
    3. 推奨される攻撃の崩し方（パス回しやスペースの突き方）
    について、プロの視点から日本語で簡潔に（3つの箇条書きと総括で）解説してください。

    【トラッキング状況データ】
    {data.tracking_summary}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"status": "success", "analysis": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
