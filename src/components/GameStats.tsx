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
	return (
		<div className="flex gap-4 mb-4 text-white">
			{gameMode !== "zen" && (
				<>
					<div className="bg-gray-700 rounded-lg px-4 py-2">
						<div className="text-sm opacity-80">Score</div>
						<div className="text-2xl font-bold">{score}</div>
					</div>
					<div className="bg-gray-700 rounded-lg px-4 py-2">
						<div className="text-sm opacity-80">Combo</div>
						<div className="text-2xl font-bold">x{combo}</div>
					</div>
				</>
			)}
			{gameMode === "time" && (
				<div className="bg-gray-700 rounded-lg px-4 py-2">
					<div className="text-sm opacity-80">Time</div>
					<div className="text-2xl font-bold">{timeLeft}s</div>
				</div>
			)}
			<div className="bg-gray-700 rounded-lg px-4 py-2">
				<div className="text-sm opacity-80">Scale</div>
				<div className="text-lg font-bold capitalize">{currentScale}</div>
			</div>
		</div>
	);
};
