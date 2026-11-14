"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, RotateCcw, Upload, Shield, Users, Activity, Settings, Zap } from "lucide-react";

export default function TacticalBoardApp() {
  // 状態管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 選手のモック座標（0〜100%の相対位置）
  const [players, setPlayers] = useState([
    { id: 1, team: "home", x: 50, y: 85, number: 1, name: "GK" },
    { id: 2, team: "home", x: 30, y: 65, number: 2, name: "DF" },
    { id: 3, team: "home", x: 50, y: 60, number: 4, name: "CB" },
    { id: 4, team: "home", x: 70, y: 65, number: 3, name: "DF" },
    { id: 5, team: "home", x: 40, y: 40, number: 6, name: "MF" },
    { id: 6, team: "home", x: 60, y: 40, number: 8, name: "MF" },
    { id: 7, team: "home", x: 50, y: 20, number: 10, name: "FW" },
    // 相手チーム (Away)
    { id: 8, team: "away", x: 50, y: 15, number: 1, name: "GK" },
    { id: 9, team: "away", x: 35, y: 30, number: 5, name: "DF" },
    { id: 10, team: "away", x: 65, y: 30, number: 4, name: "DF" },
    { id: 11, team: "away", x: 50, y: 45, number: 10, name: "MF" },
  ]);

  const [ball, setBall] = useState({ x: 50, y: 40 });

  // 動画アップロード処理
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setIsAnalyzing(true);
      // モック：AI解析中の演出
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  // 再生ボタンのトグル
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // 再生中に選手をランダムに少し動かすモックアニメーション
    if (!isPlaying) {
      const interval = setInterval(() => {
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            x: Math.max(10, Math.min(90, p.x + (Math.random() - 0.5) * 6)),
            y: Math.max(10, Math.min(90, p.y + (Math.random() - 0.5) * 6)),
          }))
        );
        setBall((prev) => ({
          x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 10)),
          y: Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 10)),
        }));
      }, 800);
      return () => clearInterval(interval);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* サイドバー */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-wider">TacticsAI</h1>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                selectedTab === "dashboard" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" /> 戦術コンバーター
            </button>
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                selectedTab === "analytics" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" /> AI戦術インサイト
            </button>
            <button
              onClick={() => setSelectedTab("teams")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                selectedTab === "teams" ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> フォーメーション設定
            </button>
          </nav>
        </div>
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Pro Plan | v1.0.0-beta
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {selectedTab === "dashboard" && "ビデオトラッキング & 2Dボード同期"}
              {selectedTab === "analytics" && "Gemini AI 戦術分析レポート"}
              {selectedTab === "teams" && "フォーメーションエディタ"}
            </h2>
          </div>
          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-lg shadow-emerald-900/20">
            <Upload className="w-4 h-4" />
            サッカー動画をアップロード
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
          </label>
        </header>

        {/* ワークスペース本体 */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
          {/* 左側：動画プレビュー */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800 bg-slate-950/40 font-medium text-sm text-slate-400">
              カメラ映像・AI検出ビュー
            </div>
            <div className="flex-1 relative bg-black flex items-center justify-center">
              {videoFile ? (
                <video src={videoFile} controls className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8">
                  <Upload className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
                  <p className="text-slate-400 text-sm">右上のボタンから試合の動画ファイルを選択してください</p>
                  <p className="text-slate-600 text-xs mt-1">対応形式: MP4, MOV (最大500MB)</p>
                </div>
              )}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-emerald-400 font-medium text-sm">AIが選手とボールをトラッキング中...</p>
                </div>
              )}
            </div>
          </div>

          {/* 右側：2D作戦ボード */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <span className="font-medium text-sm text-slate-400">2D戦術ボード（リアルタイム同期）</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1 rounded text-xs font-medium flex items-center gap-1 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? "一時停止" : "同期再生"}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-1 rounded transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* サッカーピッチ描画エリア */}
            <div className="flex-1 relative bg-emerald-900 p-4 flex items-center justify-center overflow-hidden">
              <div className="w-full max-w-md aspect-[2/3] bg-emerald-800 border-2 border-white/60 relative rounded-sm shadow-inner overflow-hidden">
                {/* ピッチのライン模様 */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/60"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/60 rounded-full"></div>
                {/* ペナルティエリア */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-t-0 border-white/60"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-b-0 border-white/60"></div>

                {/* 選手ドット */}
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 ${
                        p.team === "home"
                          ? "bg-sky-500 border-white text-white"
                          : "bg-rose-500 border-white text-white"
                      }`}
                    >
                      {p.number}
                    </div>
                    <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {p.name}
                    </span>
                  </div>
                ))}

                {/* ボール */}
                <div
                  className="absolute w-3.5 h-3.5 bg-yellow-400 border border-black rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-300 animate-pulse"
                  style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
