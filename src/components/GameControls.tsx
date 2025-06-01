import { Music, Sparkles, Volume2, VolumeX } from "lucide-react";
import { colors } from "../constants/game";

interface GameControlsProps {
	showGrid: boolean;
	soundEnabled: boolean;
	onToggleGrid: () => void;
	onToggleSound: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
	showGrid,
	soundEnabled,
	onToggleGrid,
	onToggleSound,
}) => {
	return (
		<div className="flex justify-between items-center mb-4">
			<h1
				className="text-4xl flex items-center gap-3"
				style={{
					fontFamily: "var(--font-display)",
					color: colors.primary,
					textShadow: `0 0 10px ${colors.primary}40`,
				}}
			>
				<Sparkles className="animate-pulse" style={{ color: colors.accent }} />
				Tap Ripple
			</h1>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onToggleGrid}
					className={`p-3 rounded-full transition-all btn-3d ${showGrid ? "scale-110" : "hover:scale-105"}`}
					style={{
						backgroundColor: showGrid ? colors.primary : colors.secondary,
						color: "white",
					}}
					title="Toggle Grid (G)"
				>
					<Music size={24} />
				</button>
				<button
					type="button"
					onClick={onToggleSound}
					className="p-3 rounded-full transition-all btn-3d hover:scale-105"
					style={{
						backgroundColor: soundEnabled ? colors.success : colors.warning,
						color: "white",
					}}
				>
					{soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
				</button>
			</div>
		</div>
	);
};
