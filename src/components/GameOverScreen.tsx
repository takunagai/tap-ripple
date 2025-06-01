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
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl">
			<h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
			<p className="text-2xl text-white mb-2">Score: {score}</p>
			<p className="text-lg text-white mb-6">High Score: {highScore}</p>
			<button
				type="button"
				onClick={onBackToMenu}
				className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors"
			>
				メニューに戻る
			</button>
		</div>
	);
};