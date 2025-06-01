import { useCallback } from "react";
import { colors, scales } from "../constants/game";
import type {
	GameMode,
	GameObjects,
	Particle,
	Ripple,
	ScaleType,
} from "../types/game";

interface UseGameLogicProps {
	gameMode: GameMode;
	currentScale: ScaleType;
	gameObjects: React.MutableRefObject<GameObjects>;
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	setScore: React.Dispatch<React.SetStateAction<number>>;
	setCombo: React.Dispatch<React.SetStateAction<number>>;
	combo: number;
	createChord: (notes: number[]) => void;
}

export const useGameLogic = ({
	gameMode,
	currentScale,
	gameObjects,
	canvasRef,
	setScore,
	setCombo,
	combo,
	createChord,
}: UseGameLogicProps) => {
	// パーティクル作成
	const createParticles = useCallback(
		(x: number, y: number, count = 10) => {
			for (let i = 0; i < count; i++) {
				const angle = (Math.PI * 2 * i) / count;
				const speed = 2 + Math.random() * 3;
				const particle: Particle = {
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					life: 1,
					color: colors.particle,
					size: 3 + Math.random() * 3,
				};
				gameObjects.current.particles.push(particle);
			}
		},
		[gameObjects],
	);

	// 波紋の作成（長押し対応）
	const createRipple = useCallback(
		(x: number, y: number, size = 1) => {
			const currentScaleNotes = scales[currentScale];
			const canvas = canvasRef.current;
			const height = canvas?.height || 600; // デフォルトの高さ
			const noteIndex = Math.floor((y / height) * currentScaleNotes.length);
			const note = currentScaleNotes[currentScaleNotes.length - 1 - noteIndex]; // 上が高音、下が低音

			const ripple: Ripple = {
				x,
				y,
				radius: 0,
				maxRadius: 100 + size * 100, // サイズに応じて最大半径を変更
				speed: 2,
				color: colors.ripple[Math.floor(Math.random() * colors.ripple.length)],
				opacity: 0.8,
				lineWidth: 3 + size,
				note: note,
				size: size,
				id: Date.now() + Math.random(),
			};

			gameObjects.current.ripples.push(ripple);

			// 単音を鳴らす
			createChord([note]);

			// ターゲットとの衝突チェック
			if (gameMode === "score") {
				gameObjects.current.targets.forEach((target, index) => {
					const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
					if (dist < 30) {
						setScore((prev) => prev + 50 * size);
						createParticles(target.x, target.y, 15);
						gameObjects.current.targets.splice(index, 1);
					}
				});
			}
		},
		[
			currentScale,
			canvasRef,
			gameObjects,
			createChord,
			gameMode,
			setScore,
			createParticles,
		],
	);

	// 波紋の交差判定（和音生成）
	const checkIntersections = useCallback(() => {
		const ripples = gameObjects.current.ripples;
		const currentIntersections = new Map<string, boolean>();

		for (let i = 0; i < ripples.length; i++) {
			const intersectingRipples = [ripples[i]];

			for (let j = 0; j < ripples.length; j++) {
				if (i === j) continue;

				const r1 = ripples[i];
				const r2 = ripples[j];
				const dist = Math.sqrt((r1.x - r2.x) ** 2 + (r1.y - r2.y) ** 2);

				// 波紋が重なっているかチェック
				if (
					dist < r1.radius + r2.radius &&
					dist > Math.abs(r1.radius - r2.radius)
				) {
					intersectingRipples.push(r2);
				}
			}

			if (intersectingRipples.length > 1) {
				const key = intersectingRipples
					.map((r) => r.id)
					.sort()
					.join("-");

				if (!gameObjects.current.intersections.has(key)) {
					// 新しい交差：和音を生成
					const notes = intersectingRipples.map((r) => r.note);
					const uniqueNotes = [...new Set(notes)];

					if (uniqueNotes.length > 1) {
						createChord(uniqueNotes);

						// 交差点でパーティクル生成
						const centerX =
							intersectingRipples.reduce((sum, r) => sum + r.x, 0) /
							intersectingRipples.length;
						const centerY =
							intersectingRipples.reduce((sum, r) => sum + r.y, 0) /
							intersectingRipples.length;
						createParticles(centerX, centerY, uniqueNotes.length * 5);

						// スコア計算
						if (gameMode !== "zen") {
							const points = uniqueNotes.length ** 2 * 10; // 2音=40点, 3音=90点, 4音=160点
							setScore((prev) => prev + points * (combo + 1));
							setCombo((prev) => prev + 1);
						}
					}
				}

				currentIntersections.set(key, true);
			}
		}

		// 古い交差点を削除
		gameObjects.current.intersections = currentIntersections;

		// コンボリセット
		if (currentIntersections.size === 0 && combo > 0) {
			setTimeout(() => setCombo(0), 1000);
		}
	}, [
		combo,
		gameMode,
		createChord,
		createParticles,
		gameObjects,
		setScore,
		setCombo,
	]);

	// ターゲット生成
	const spawnTarget = useCallback(() => {
		if (gameMode === "score" && gameObjects.current.targets.length < 3) {
			gameObjects.current.targets.push({
				x: 50 + Math.random() * 300,
				y: 50 + Math.random() * 500,
				radius: 25,
				pulse: 0,
			});
		}
	}, [gameMode, gameObjects]);

	return {
		createRipple,
		createParticles,
		checkIntersections,
		spawnTarget,
	};
};
