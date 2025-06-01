import { Heart, Timer, Trophy } from "lucide-react";
import type { GameMode } from "../types/game";

interface GameMenuProps {
	onStartGame: (mode: GameMode) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onStartGame }) => {
	return (
		<div className="flex flex-col items-center justify-center p-8">
			<h2 className="text-4xl font-bold text-white mb-8">Tap Ripple</h2>
			<p className="text-white mb-4 text-center px-8">
				画面をタップして美しい波紋を作ろう
				<br />
				長押しまたは連続タップで大きな波紋
				<br />
				波紋の重なりで和音を奏でる
			</p>
			<div className="text-sm text-gray-400 mb-6 px-8 text-center">
				<p>← → キー: スケール切り替え</p>
				<p>G キー: グリッド表示</p>
				<p>連続タップ: より大きな波紋</p>
				<p>上が高音、下が低音</p>
			</div>
			<div className="flex flex-col gap-4">
				<button
					type="button"
					onClick={() => onStartGame("zen")}
					className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
				>
					<Heart size={20} />
					禅モード（リラックス）
				</button>
				<button
					type="button"
					onClick={() => onStartGame("score")}
					className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
				>
					<Trophy size={20} />
					スコアアタック
				</button>
				<button
					type="button"
					onClick={() => onStartGame("time")}
					className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
				>
					<Timer size={20} />
					タイムチャレンジ（60秒）
				</button>
			</div>
		</div>
	);
};
