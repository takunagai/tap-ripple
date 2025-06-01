import type { ScaleType } from "../types/game";

// 音階の定義（複数のスケール）
export const scales: Record<ScaleType, number[]> = {
	major: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25], // C Major
	minor: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25], // C Minor
	pentatonic: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // Pentatonic
	blues: [261.63, 311.13, 349.23, 370.0, 392.0, 466.16, 523.25], // Blues
	japanese: [261.63, 277.18, 329.63, 349.23, 415.3, 523.25], // Japanese Scale
};

// カラーパレット
export const colors = {
	bg: "#0a0a1a",
	ripple: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"],
	particle: "#FFE66D",
	target: "#06FFA5",
	grid: "#FFFFFF15",
};

// ゲーム設定
export const DEFAULT_BPM = 120;
export const DEFAULT_TIME_LIMIT = 60;
export const GRID_SIZE = 50;
export const TAP_THRESHOLD = 300; // 連続タップの判定時間（ms）