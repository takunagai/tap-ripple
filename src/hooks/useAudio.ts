import { useCallback, useRef } from "react";
import type { GameObjects } from "../types/game";

export const useAudio = (
	soundEnabled: boolean,
	gameObjects: React.MutableRefObject<GameObjects>,
) => {
	const audioContextRef = useRef<AudioContext | null>(null);

	const getAudioContext = useCallback((): AudioContext => {
		if (!audioContextRef.current) {
			audioContextRef.current = new (
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext
			)();
		}
		return audioContextRef.current;
	}, []);

	// 和音生成関数
	const createChord = useCallback(
		(notes: number[]) => {
			if (!soundEnabled || notes.length === 0) return;

			const audioContext = getAudioContext();
			const now = audioContext.currentTime;

			notes.forEach((note, index) => {
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();
				const filter = audioContext.createBiquadFilter();

				oscillator.connect(filter);
				filter.connect(gainNode);
				gainNode.connect(audioContext.destination);

				oscillator.frequency.value = note;
				oscillator.type = "sine";

				filter.type = "lowpass";
				filter.frequency.value = 2000;

				// 和音の各音に少し違うタイミングと音量を設定
				const delay = index * 0.01;
				const volume = 0.3 / Math.sqrt(notes.length); // 音数が多いほど各音を小さく

				gainNode.gain.setValueAtTime(0, now + delay);
				gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.05);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 1);

				oscillator.start(now + delay);
				oscillator.stop(now + delay + 1.2);

				gameObjects.current.activeOscillators.push({
					oscillator,
					gainNode,
					startTime: now,
				});
			});
		},
		[soundEnabled, getAudioContext, gameObjects],
	);

	// グリッドビート音
	const playGridBeat = useCallback(
		(showGrid: boolean) => {
			if (!soundEnabled || !showGrid) return;

			const audioContext = getAudioContext();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = 880;
			oscillator.type = "sine";

			gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				audioContext.currentTime + 0.05,
			);

			oscillator.start();
			oscillator.stop(audioContext.currentTime + 0.05);
		},
		[soundEnabled, getAudioContext],
	);

	return {
		createChord,
		playGridBeat,
	};
};
