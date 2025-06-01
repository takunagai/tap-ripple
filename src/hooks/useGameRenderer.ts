import { useCallback } from "react";
import { GRID_SIZE, colors, scales } from "../constants/game";
import type { GameObjects, ScaleType } from "../types/game";

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
			ctx.fillStyle = colors.bg;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// レトロなグラデーション背景
			const gradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				canvas.width * 0.7,
			);
			gradient.addColorStop(0, `${colors.bgGradient2}40`);
			gradient.addColorStop(0.5, `${colors.bgGradient1}20`);
			gradient.addColorStop(1, "transparent");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// ドットパターンオーバーレイ
			ctx.fillStyle = `${colors.textLight}08`;
			for (let x = 0; x < canvas.width; x += 10) {
				for (let y = 0; y < canvas.height; y += 10) {
					if ((x + y) % 20 === 0) {
						ctx.fillRect(x, y, 2, 2);
					}
				}
			}

			// リズムグリッド描画
			if (showGrid) {
				ctx.strokeStyle = colors.grid;
				ctx.lineWidth = 1;

				// グリッドパルス効果
				if (gameObjects.current.gridPulse > 0) {
					gameObjects.current.gridPulse -= 0.05;
					ctx.strokeStyle = `${colors.accent}${Math.floor(
						60 * gameObjects.current.gridPulse,
					)
						.toString(16)
						.padStart(2, "0")}`;
					ctx.lineWidth = 3;
					ctx.shadowBlur = 10;
					ctx.shadowColor = colors.accent;
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

				ctx.shadowBlur = 0;

				// 音階ガイド
				const scaleNotes = scales[currentScale];
				const noteHeight = canvas.height / scaleNotes.length;
				ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
				ctx.fillStyle = colors.textLight;

				scaleNotes.forEach((note, index) => {
					const y = (index + 0.5) * noteHeight;
					ctx.globalAlpha = 0.3;
					ctx.fillText(`♪ ${Math.round(note)}Hz`, 10, y);
					ctx.globalAlpha = 1;
				});
			}

			// 波紋の更新と描画
			gameObjects.current.ripples = gameObjects.current.ripples.filter(
				(ripple) => {
					ripple.radius += ripple.speed;
					ripple.opacity *= 0.98;

					if (ripple.opacity > 0.01) {
						// ネオンエフェクト
						ctx.shadowBlur = 20;
						ctx.shadowColor = ripple.color;

						ctx.strokeStyle = `${ripple.color}${Math.floor(ripple.opacity * 255)
							.toString(16)
							.padStart(2, "0")}`;
						ctx.lineWidth = ripple.lineWidth;
						ctx.beginPath();
						ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
						ctx.stroke();

						// 内側の波紋
						ctx.strokeStyle = `${ripple.color}${Math.floor(ripple.opacity * 127)
							.toString(16)
							.padStart(2, "0")}`;
						ctx.lineWidth = ripple.lineWidth * 0.5;
						ctx.beginPath();
						ctx.arc(ripple.x, ripple.y, ripple.radius * 0.8, 0, Math.PI * 2);
						ctx.stroke();

						ctx.shadowBlur = 0;
						return true;
					}
					return false;
				},
			);

			// パーティクルの更新と描画
			gameObjects.current.particles = gameObjects.current.particles.filter(
				(particle) => {
					particle.x += particle.vx;
					particle.y += particle.vy;
					particle.vy += 0.1;
					particle.life -= 0.02;

					if (particle.life > 0) {
						// キラキラエフェクト
						ctx.save();
						ctx.translate(particle.x, particle.y);
						ctx.rotate(Date.now() * 0.01);

						ctx.fillStyle = `${particle.color}${Math.floor(particle.life * 255)
							.toString(16)
							.padStart(2, "0")}`;
						ctx.shadowBlur = 10;
						ctx.shadowColor = particle.color;

						// 星型パーティクル
						ctx.beginPath();
						for (let i = 0; i < 5; i++) {
							const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
							const x = Math.cos(angle) * particle.size;
							const y = Math.sin(angle) * particle.size;
							if (i === 0) ctx.moveTo(x, y);
							else ctx.lineTo(x, y);

							const innerAngle = angle + Math.PI / 5;
							const innerX = Math.cos(innerAngle) * particle.size * 0.5;
							const innerY = Math.sin(innerAngle) * particle.size * 0.5;
							ctx.lineTo(innerX, innerY);
						}
						ctx.closePath();
						ctx.fill();

						ctx.restore();
						ctx.shadowBlur = 0;
						return true;
					}
					return false;
				},
			);

			// ターゲットの描画
			gameObjects.current.targets.forEach((target) => {
				target.pulse = (target.pulse + 0.05) % (Math.PI * 2);
				const scale = 1 + Math.sin(target.pulse) * 0.2;

				// ターゲットの外円（ネオンエフェクト）
				ctx.shadowBlur = 20;
				ctx.shadowColor = colors.targetGlow;
				ctx.strokeStyle = colors.target;
				ctx.lineWidth = 4;
				ctx.beginPath();
				ctx.arc(target.x, target.y, target.radius * scale, 0, Math.PI * 2);
				ctx.stroke();

				// ターゲットの内円
				ctx.fillStyle = `${colors.target}40`;
				ctx.beginPath();
				ctx.arc(
					target.x,
					target.y,
					target.radius * scale * 0.8,
					0,
					Math.PI * 2,
				);
				ctx.fill();

				// 中心のドット
				ctx.fillStyle = colors.target;
				ctx.beginPath();
				ctx.arc(target.x, target.y, 3, 0, Math.PI * 2);
				ctx.fill();

				ctx.shadowBlur = 0;
			});

			// 交差点のハイライト
			gameObjects.current.intersections.forEach((_, key) => {
				const [x, y] = key.split(",").map(Number);

				// レインボーエフェクト
				const hue = (Date.now() * 0.1) % 360;
				ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
				ctx.shadowBlur = 20;
				ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

				ctx.beginPath();
				ctx.arc(x, y, 15, 0, Math.PI * 2);
				ctx.fill();

				// キラキラ
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(x, y, 3, 0, Math.PI * 2);
				ctx.fill();

				ctx.shadowBlur = 0;
			});
		},
		[currentScale, showGrid],
	);

	return { renderGame };
};
