import { Heart, Timer, Trophy } from "lucide-react";
import { colors } from "../constants/game";
import type { GameMode } from "../types/game";

interface GameMenuProps {
	onStartGame: (mode: GameMode) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onStartGame }) => {
	return (
		<div className="flex flex-col items-center justify-center p-8 animate-pop-in">
			<h2
				className="text-5xl mb-8 text-neon animate-rainbow"
				style={{
					fontFamily: "var(--font-display)",
					color: colors.primary,
					textShadow: `0 0 10px ${colors.primary}40, 0 0 20px ${colors.primary}30`,
				}}
			>
				Tap Ripple
			</h2>
			<p
				className="mb-4 text-center px-8 font-semibold"
				style={{ color: colors.text, fontFamily: "var(--font-japanese)" }}
			>
				画面をタップして美しい波紋を作ろう
				<br />
				長押しまたは連続タップで大きな波紋
				<br />
				波紋の重なりで和音を奏でる
			</p>
			<div
				className="text-sm mb-6 px-8 text-center"
				style={{ color: colors.textLight, fontFamily: "var(--font-japanese)" }}
			>
				<p>← → キー: スケール切り替え</p>
				<p>G キー: グリッド表示</p>
				<p>連続タップ: より大きな波紋</p>
				<p>上が高音、下が低音</p>
			</div>
			<div className="flex flex-col gap-4">
				<button
					type="button"
					onClick={() => onStartGame("zen")}
					className="btn-3d text-white px-8 py-4 flex items-center gap-3 text-lg transition-all hover:scale-105 hover:animate-rubber-band"
					style={{
						backgroundColor: "#9B59B6",
						fontFamily: "var(--font-japanese)",
						fontWeight: 700,
						animationDelay: "0.1s",
					}}
				>
					<Heart size={24} className="animate-pulse" />
					禅モード（リラックス）
				</button>
				<button
					type="button"
					onClick={() => onStartGame("score")}
					className="btn-3d text-white px-8 py-4 flex items-center gap-3 text-lg transition-all hover:scale-105 hover:animate-rubber-band"
					style={{
						backgroundColor: "#3498DB",
						fontFamily: "var(--font-japanese)",
						fontWeight: 700,
						animationDelay: "0.2s",
					}}
				>
					<Trophy
						size={24}
						className="animate-bounce"
						style={{ animationDuration: "2s" }}
					/>
					スコアアタック
				</button>
				<button
					type="button"
					onClick={() => onStartGame("time")}
					className="btn-3d text-white px-8 py-4 flex items-center gap-3 text-lg transition-all hover:scale-105 hover:animate-rubber-band"
					style={{
						backgroundColor: colors.success,
						fontFamily: "var(--font-japanese)",
						fontWeight: 700,
						animationDelay: "0.3s",
					}}
				>
					<Timer size={24} className="animate-spin-slow" />
					タイムチャレンジ（60秒）
				</button>
			</div>
		</div>
	);
};
