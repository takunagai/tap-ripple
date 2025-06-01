import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
	GameMode,
	GameObjects,
	GameState,
	ScaleType,
	TouchState,
} from "./types/game";
import {
	colors,
	scales,
	DEFAULT_BPM,
	DEFAULT_TIME_LIMIT,
	TAP_THRESHOLD,
} from "./constants/game";
import { useAudio } from "./hooks/useAudio";
import { useGameLogic } from "./hooks/useGameLogic";
import { useGameRenderer } from "./hooks/useGameRenderer";
import { GameControls } from "./components/GameControls";
import { GameMenu } from "./components/GameMenu";
import { GameOverScreen } from "./components/GameOverScreen";
import { GameStats } from "./components/GameStats";

const TapRipple: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | null>(null);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [gameMode, setGameMode] = useState<GameMode>("zen");
	const [gameState, setGameState] = useState<GameState>("ready");
	const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LIMIT);
	const [combo, setCombo] = useState(0);
	const [currentScale, setCurrentScale] = useState<ScaleType>("major");
	const [showGrid, setShowGrid] = useState(false);
	const [bpm] = useState(DEFAULT_BPM);

	// グローバルスタイルを追加
	useEffect(() => {
		const style = document.createElement("style");
		style.innerHTML = `
      body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
    `;
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// タップ状態の管理
	const touchState = useRef<TouchState>({
		isPressed: false,
		startTime: 0,
		x: 0,
		y: 0,
		lastTapTime: 0,
		tapCount: 0,
	});

	// ゲームオブジェクト
	const gameObjects = useRef<GameObjects>({
		ripples: [],
		particles: [],
		targets: [],
		intersections: new Map(),
		lastTime: 0,
		gridPulse: 0,
		activeOscillators: [],
	});

	// カスタムフックを使用
	const { createChord, playGridBeat } = useAudio(soundEnabled, gameObjects);
	const { createRipple, checkIntersections, spawnTarget } = useGameLogic({
		gameMode,
		currentScale,
		gameObjects,
		canvasRef,
		setScore,
		setCombo,
		combo,
		createChord,
	});
	const { renderGame } = useGameRenderer({
		gameObjects,
		currentScale,
		showGrid,
	});

	// グリッドビートの処理
	useEffect(() => {
		if (!showGrid || gameState !== "playing") return;

		const beatInterval = 60000 / bpm; // BPMから間隔を計算
		const timer = setInterval(() => {
			playGridBeat(showGrid);
			gameObjects.current.gridPulse = 1;
		}, beatInterval);

		return () => clearInterval(timer);
	}, [showGrid, gameState, bpm, playGridBeat]);

	// ゲームループ
	const gameLoop = useCallback(
		(_timestamp: number) => {
			if (gameState !== "playing") return;

			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			// レンダリング
			renderGame(ctx, canvas);

			// 波紋の交差チェック
			checkIntersections();

			// ターゲット生成
			if (Math.random() < 0.01) {
				spawnTarget();
			}

			animationRef.current = requestAnimationFrame(gameLoop);
		},
		[gameState, renderGame, checkIntersections, spawnTarget],
	);

	// マウス/タッチイベントハンドラー
	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (gameState !== "playing") return;

		e.preventDefault(); // デフォルト動作を防ぐ

		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const now = Date.now();

		// 連続タップチェック
		if (now - touchState.current.lastTapTime < TAP_THRESHOLD) {
			touchState.current.tapCount++;
		} else {
			touchState.current.tapCount = 1;
		}

		touchState.current = {
			...touchState.current,
			isPressed: true,
			startTime: now,
			lastTapTime: now,
			x,
			y,
		};

		// 連続タップに応じたサイズ
		const tapSize = Math.min(touchState.current.tapCount * 0.5, 3);
		createRipple(x, y, tapSize);
	};

	const handlePointerUp = () => {
		if (!touchState.current.isPressed) return;

		const duration = Date.now() - touchState.current.startTime;
		const size = Math.min(duration / 500, 3); // 最大3倍サイズ

		// 長押しで追加の波紋（連続タップでない場合のみ）
		if (size > 0.5 && touchState.current.tapCount === 1) {
			createRipple(touchState.current.x, touchState.current.y, size);
		}

		touchState.current.isPressed = false;
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!touchState.current.isPressed) return;

		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;
		touchState.current.x = e.clientX - rect.left;
		touchState.current.y = e.clientY - rect.top;
	};

	// スケール切り替え（左右スワイプ）
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (gameState !== "playing") return;

			const scaleNames = Object.keys(scales) as ScaleType[];
			const currentIndex = scaleNames.indexOf(currentScale);

			if (e.key === "ArrowLeft") {
				const newIndex =
					(currentIndex - 1 + scaleNames.length) % scaleNames.length;
				setCurrentScale(scaleNames[newIndex]);
			} else if (e.key === "ArrowRight") {
				const newIndex = (currentIndex + 1) % scaleNames.length;
				setCurrentScale(scaleNames[newIndex]);
			} else if (e.key === "g") {
				setShowGrid((prev) => !prev);
			}
		},
		[gameState, currentScale],
	);

	// ゲーム開始
	const startGame = (mode: GameMode) => {
		setGameMode(mode);
		setScore(0);
		setCombo(0);
		setTimeLeft(DEFAULT_TIME_LIMIT);
		gameObjects.current = {
			ripples: [],
			particles: [],
			targets: [],
			intersections: new Map(),
			lastTime: 0,
			gridPulse: 0,
			activeOscillators: [],
		};
		setGameState("playing");
	};

	// タイマー処理
	useEffect(() => {
		if (gameState === "playing" && gameMode === "time") {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setGameState("gameover");
						setHighScore(Math.max(highScore, score));
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [gameState, gameMode, score, highScore]);

	// ゲームループの開始
	useEffect(() => {
		if (gameState === "playing") {
			animationRef.current = requestAnimationFrame(gameLoop);
		}
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [gameState, gameLoop]);

	// キャンバス要素への参照を使ってイベントリスナーを追加
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// コンテキストメニューを無効化
		const preventContextMenu = (e: Event) => {
			e.preventDefault();
			return false;
		};

		// タッチイベントのデフォルト動作を防ぐ
		const preventDefaults = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

		canvas.addEventListener("contextmenu", preventContextMenu);
		canvas.addEventListener("touchstart", preventDefaults, { passive: false });
		canvas.addEventListener("touchmove", preventDefaults, { passive: false });
		canvas.addEventListener("touchend", preventDefaults, { passive: false });

		return () => {
			canvas.removeEventListener("contextmenu", preventContextMenu);
			canvas.removeEventListener("touchstart", preventDefaults);
			canvas.removeEventListener("touchmove", preventDefaults);
			canvas.removeEventListener("touchend", preventDefaults);
		};
	}, []);

	// キーボードイベントリスナー
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 select-none"
			style={{
				userSelect: "none",
				WebkitUserSelect: "none",
				WebkitTouchCallout: "none",
			}}
		>
			<div className="bg-gray-800 rounded-3xl p-6 shadow-2xl">
				<GameControls
					showGrid={showGrid}
					soundEnabled={soundEnabled}
					onToggleGrid={() => setShowGrid(!showGrid)}
					onToggleSound={() => setSoundEnabled(!soundEnabled)}
				/>

				{gameState === "playing" && (
					<GameStats
						gameMode={gameMode}
						score={score}
						combo={combo}
						timeLeft={timeLeft}
						currentScale={currentScale}
					/>
				)}

				<div className="relative">
					{gameState !== "ready" && (
						<canvas
							ref={canvasRef}
							width={400}
							height={600}
							onPointerDown={handlePointerDown}
							onPointerUp={handlePointerUp}
							onPointerMove={handlePointerMove}
							onPointerLeave={handlePointerUp}
							onContextMenu={(e) => e.preventDefault()}
							onTouchStart={(e) => e.preventDefault()}
							className="bg-gray-900 rounded-2xl cursor-pointer border-2 border-gray-700 select-none"
							style={{
								backgroundColor: colors.bg,
								touchAction: "none",
								userSelect: "none",
								WebkitUserSelect: "none",
								WebkitTouchCallout: "none",
								WebkitTapHighlightColor: "transparent",
							}}
						/>
					)}

					{gameState === "ready" && (
						<div className="w-[400px] h-[600px] flex items-center justify-center bg-gray-900 rounded-2xl border-2 border-gray-700">
							<GameMenu onStartGame={startGame} />
						</div>
					)}

					{gameState === "gameover" && (
						<GameOverScreen
							score={score}
							highScore={highScore}
							onBackToMenu={() => setGameState("ready")}
						/>
					)}
				</div>

				{gameState === "playing" && (
					<div className="mt-4 text-white text-center">
						<p className="text-sm opacity-80">
							{gameMode === "zen" &&
								"長押し or 連続タップで大きな波紋、重なりで和音を楽しもう"}
							{gameMode === "score" &&
								"緑のターゲットを狙って、和音で高得点を目指そう"}
							{gameMode === "time" && "60秒間でハイスコアを目指そう！"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TapRipple;
