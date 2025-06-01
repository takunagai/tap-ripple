import { colors } from "../constants/game";
import type { GameMode, ScaleType } from "../types/game";

interface GameStatsProps {
	gameMode: GameMode;
	score: number;
	combo: number;
	timeLeft: number;
	currentScale: ScaleType;
}

export const GameStats: React.FC<GameStatsProps> = ({
	gameMode,
	score,
	combo,
	timeLeft,
	currentScale,
}) => {
	const scaleNameMap: Record<ScaleType, string> = {
		major: "メジャー",
		minor: "マイナー",
		pentatonic: "ペンタトニック",
		blues: "ブルース",
		japanese: "日本音階",
	};

	return (
		<div className="flex gap-4 mb-4">
			{gameMode !== "zen" && (
				<>
					<div
						className="rounded-xl px-5 py-3 shadow-lg"
						style={{
							backgroundColor: "white",
							border: `3px solid ${colors.primary}`,
							boxShadow: "0 4px 0 rgba(0, 0, 0, 0.2)",
						}}
					>
						<div
							className="text-sm font-semibold"
							style={{
								color: colors.textLight,
								fontFamily: "var(--font-japanese)",
							}}
						>
							スコア
						</div>
						<div
							className="text-3xl font-bold"
							style={{
								color: colors.primary,
								fontFamily: "var(--font-display)",
							}}
						>
							{score}
						</div>
					</div>
					<div
						className="rounded-xl px-5 py-3 shadow-lg"
						style={{
							backgroundColor: "white",
							border: `3px solid ${colors.accent}`,
							boxShadow: "0 4px 0 rgba(0, 0, 0, 0.2)",
						}}
					>
						<div
							className="text-sm font-semibold"
							style={{
								color: colors.textLight,
								fontFamily: "var(--font-japanese)",
							}}
						>
							コンボ
						</div>
						<div
							className="text-3xl font-bold"
							style={{
								color: colors.accent,
								fontFamily: "var(--font-display)",
							}}
						>
							x{combo}
						</div>
					</div>
				</>
			)}
			{gameMode === "time" && (
				<div
					className="rounded-xl px-5 py-3 shadow-lg"
					style={{
						backgroundColor: "white",
						border: `3px solid ${colors.warning}`,
						boxShadow: "0 4px 0 rgba(0, 0, 0, 0.2)",
					}}
				>
					<div
						className="text-sm font-semibold"
						style={{
							color: colors.textLight,
							fontFamily: "var(--font-japanese)",
						}}
					>
						残り時間
					</div>
					<div
						className="text-3xl font-bold"
						style={{
							color: timeLeft <= 10 ? colors.target : colors.warning,
							fontFamily: "var(--font-display)",
						}}
					>
						{timeLeft}s
					</div>
				</div>
			)}
			<div
				className="rounded-xl px-5 py-3 shadow-lg"
				style={{
					backgroundColor: "white",
					border: `3px solid ${colors.secondary}`,
					boxShadow: "0 4px 0 rgba(0, 0, 0, 0.2)",
				}}
			>
				<div
					className="text-sm font-semibold"
					style={{
						color: colors.textLight,
						fontFamily: "var(--font-japanese)",
					}}
				>
					音階
				</div>
				<div
					className="text-xl font-bold"
					style={{
						color: colors.secondary,
						fontFamily: "var(--font-japanese)",
					}}
				>
					{scaleNameMap[currentScale]}
				</div>
			</div>
		</div>
	);
};
