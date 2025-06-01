import { colors } from "../constants/game";

interface GameOverScreenProps {
	score: number;
	highScore: number;
	onBackToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
	score,
	highScore,
	onBackToMenu,
}) => {
	const isNewHighScore = score >= highScore && score > 0;

	return (
		<div
			className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md rounded-2xl"
			style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
		>
			<h2
				className="text-5xl mb-6 animate-bounce"
				style={{
					fontFamily: "var(--font-display)",
					color: colors.primary,
					textShadow: `0 0 20px ${colors.primary}40`,
				}}
			>
				Game Over
			</h2>

			{isNewHighScore && (
				<div
					className="mb-4 text-2xl font-bold animate-pulse"
					style={{
						color: colors.accent,
						fontFamily: "var(--font-japanese)",
					}}
				>
					🎉 新記録達成！ 🎉
				</div>
			)}

			<div
				className="mb-6 text-center rounded-xl px-8 py-4"
				style={{
					backgroundColor: "white",
					border: `4px solid ${colors.primary}`,
					boxShadow: "0 6px 0 rgba(0, 0, 0, 0.2)",
				}}
			>
				<p
					className="text-3xl font-bold mb-2"
					style={{ color: colors.primary, fontFamily: "var(--font-display)" }}
				>
					Score: {score}
				</p>
				<p
					className="text-xl"
					style={{
						color: colors.textLight,
						fontFamily: "var(--font-japanese)",
					}}
				>
					ハイスコア: {highScore}
				</p>
			</div>

			<button
				type="button"
				onClick={onBackToMenu}
				className="btn-3d text-white px-10 py-4 text-xl transition-all hover:scale-105"
				style={{
					backgroundColor: colors.primary,
					fontFamily: "var(--font-japanese)",
					fontWeight: 700,
				}}
			>
				メニューに戻る
			</button>
		</div>
	);
};
