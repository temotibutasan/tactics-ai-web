from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import random

app = FastAPI(title="TacticsAI Backend", version="1.0.0")

# Next.jsからのクロスドメイン通信（CORS）を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "TacticsAI Backend is running successfully!"}

@app.post("/api/track-video")
async def track_video(file: UploadFile = File(...)):
    """
    アップロードされた動画を受け取り、AIトラッキング結果（座標時系列データ）を生成して返す
    """
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # ここにYOLO等のAIトラッキング処理を組み込みます
    # 今回はシミュレーションとして、フレームごとのモック座標データを返却します
    
    frames_data = []
    for frame_id in range(30):  # 30フレーム分のシミュレーションデータ
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
