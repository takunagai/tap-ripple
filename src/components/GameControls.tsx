import { Music, Sparkles, Volume2, VolumeX } from "lucide-react";

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
			<h1 className="text-3xl font-bold text-white flex items-center gap-2">
				<Sparkles className="text-purple-400" />
				Tap Ripple
			</h1>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onToggleGrid}
					className={`text-white p-2 rounded-lg transition-colors ${showGrid ? "bg-purple-600" : "hover:bg-gray-700"}`}
					title="Toggle Grid (G)"
				>
					<Music />
				</button>
				<button
					type="button"
					onClick={onToggleSound}
					className="text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
				>
					{soundEnabled ? <Volume2 /> : <VolumeX />}
				</button>
			</div>
		</div>
	);
};