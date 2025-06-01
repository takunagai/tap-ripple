export interface Ripple {
	x: number;
	y: number;
	radius: number;
	maxRadius: number;
	speed: number;
	color: string;
	opacity: number;
	lineWidth: number;
	note: number;
	size: number;
	id: number;
}

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	color: string;
	size: number;
}

export interface Target {
	x: number;
	y: number;
	radius: number;
	pulse: number;
}

export interface GameObjects {
	ripples: Ripple[];
	particles: Particle[];
	targets: Target[];
	intersections: Map<string, boolean>;
	lastTime: number;
	gridPulse: number;
	activeOscillators: Array<{
		oscillator: OscillatorNode;
		gainNode: GainNode;
		startTime: number;
	}>;
}

export interface TouchState {
	isPressed: boolean;
	startTime: number;
	x: number;
	y: number;
	lastTapTime: number;
	tapCount: number;
}

export type GameMode = "zen" | "score" | "time";
export type GameState = "ready" | "playing" | "gameover";
export type ScaleType = "major" | "minor" | "pentatonic" | "blues" | "japanese";