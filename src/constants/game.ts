import type { ScaleType } from "../types/game";

// 音階の定義（複数のスケール）
export const scales: Record<ScaleType, number[]> = {
	major: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25], // C Major
	minor: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25], // C Minor
	pentatonic: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // Pentatonic
	blues: [261.63, 311.13, 349.23, 370.0, 392.0, 466.16, 523.25], // Blues
	japanese: [261.63, 277.18, 329.63, 349.23, 415.3, 523.25], // Japanese Scale
};

// レトロポップなカラーパレット
export const colors = {
	// 背景色（温かみのあるクリーム色）
	bg: "#FFF8E7",
	bgDark: "#FFE5B4",

	// メイン背景のグラデーション
	bgGradient1: "#FFD6BA",
	bgGradient2: "#FFEAA7",
	bgGradient3: "#DFE6E9",

	// 波紋の色（ビビッドでポップな色）
	ripple: [
		"#FF6B9D",
		"#C44569",
		"#FFC75F",
		"#F8B500",
		"#9B59B6",
		"#3498DB",
		"#1ABC9C",
	],

	// パーティクル（キラキラした黄色）
	particle: "#FFD700",
	particleAlt: "#FFA500",

	// ターゲット（ネオンピンク）
	target: "#FF1744",
	targetGlow: "#FF6B9D",

	// グリッド（薄い紫）
	grid: "#9B59B633",

	// UI要素の色
	primary: "#FF6B9D",
	secondary: "#C44569",
	accent: "#FFD93D",
	success: "#6BCF7F",
	warning: "#FFA500",

	// テキスト色
	text: "#2D3436",
	textLight: "#636E72",

	// ボタンの影色
	shadow: "#00000020",
	shadowDark: "#00000040",
};

// ゲーム設定
export const DEFAULT_BPM = 120;
export const DEFAULT_TIME_LIMIT = 60;
export const GRID_SIZE = 50;
export const TAP_THRESHOLD = 300; // 連続タップの判定時間（ms）
