import { useCallback } from "react";
import type { GameObjects, ScaleType } from "../types/game";
import { colors, scales, GRID_SIZE } from "../constants/game";

interface UseGameRendererProps {
	gameObjects: React.MutableRefObject<GameObjects>;
	currentScale: ScaleType;
	showGrid: boolean;
}

export const useGameRenderer = ({
	gameObjects,
	currentScale,
	showGrid,
}: UseGameRendererProps) => {
	const renderGame = useCallback(
		(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
			// 背景をクリア
			ctx.fillStyle = `${colors.bg}40`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// グラデーション背景
			const gradient = ctx.createRadialGradient(200, 300, 0, 200, 300, 400);
			gradient.addColorStop(0, "#1a1a3a20");
			gradient.addColorStop(1, "#0a0a1a00");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// リズムグリッド描画
			if (showGrid) {
				ctx.strokeStyle = colors.grid;
				ctx.lineWidth = 1;

				// グリッドパルス効果
				if (gameObjects.current.gridPulse > 0) {
					gameObjects.current.gridPulse -= 0.05;
					ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * gameObjects.current.gridPulse})`;
					ctx.lineWidth = 2;
				}

				for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
					ctx.beginPath();
					ctx.moveTo(x, 0);
					ctx.lineTo(x, canvas.height);
					ctx.stroke();
				}

				for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
					ctx.beginPath();
					ctx.moveTo(0, y);
					ctx.lineTo(canvas.width, y);
					ctx.stroke();
				}

				// 音階ガイド
				const scaleNotes = scales[currentScale];
				const noteHeight = canvas.height / scaleNotes.length;
				ctx.font = "12px monospace";
				ctx.fillStyle = "rgba(255, 255, 255, 0.3)";

				for (let i = 0; i < scaleNotes.length; i++) {
					const y = i * noteHeight + noteHeight / 2;
					const noteNames = [
						"C",
						"C#",
						"D",
						"D#",
						"E",
						"F",
						"F#",
						"G",
						"G#",
						"A",
						"A#",
						"B",
					];
					const noteIndex =
						Math.round(
							12 * Math.log2(scaleNotes[scaleNotes.length - 1 - i] / 261.63),
						) % 12;
					ctx.fillText(noteNames[noteIndex], 10, y);
				}
			}

			// ターゲット描画
			for (const target of gameObjects.current.targets) {
				target.pulse = (target.pulse + 0.05) % (Math.PI * 2);
				const pulseSize = Math.sin(target.pulse) * 5;

				ctx.strokeStyle = colors.target;
				ctx.lineWidth = 3;
				ctx.globalAlpha = 0.6;
				ctx.beginPath();
				ctx.arc(target.x, target.y, target.radius + pulseSize, 0, Math.PI * 2);
				ctx.stroke();
				ctx.globalAlpha = 1;
			}

			// 波紋の更新と描画
			gameObjects.current.ripples = gameObjects.current.ripples.filter(
				(ripple) => {
					ripple.radius += ripple.speed;
					ripple.opacity = Math.max(0, 1 - ripple.radius / ripple.maxRadius);

					if (ripple.opacity <= 0) return false;

					// 波紋を描画
					const alpha = Math.floor(ripple.opacity * 255)
						.toString(16)
						.padStart(2, "0");
					ctx.strokeStyle = ripple.color + alpha;
					ctx.lineWidth = ripple.lineWidth * ripple.opacity;
					ctx.beginPath();
					ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
					ctx.stroke();

					// 内側の波紋
					ctx.strokeStyle =
						ripple.color +
						Math.floor(ripple.opacity * 0.5 * 255)
							.toString(16)
							.padStart(2, "0");
					ctx.lineWidth = ripple.lineWidth * 0.5 * ripple.opacity;
					ctx.beginPath();
					ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
					ctx.stroke();

					return true;
				},
			);

			// パーティクルの更新と描画
			gameObjects.current.particles = gameObjects.current.particles.filter(
				(particle) => {
					particle.x += particle.vx;
					particle.y += particle.vy;
					particle.vy += 0.1;
					particle.life -= 0.02;

					if (particle.life <= 0) return false;

					ctx.globalAlpha = particle.life;
					ctx.fillStyle = particle.color;
					ctx.fillRect(
						particle.x - particle.size / 2,
						particle.y - particle.size / 2,
						particle.size,
						particle.size,
					);
					ctx.globalAlpha = 1;

					return true;
				},
			);
		},
		[gameObjects, currentScale, showGrid],
	);

	return { renderGame };
};
