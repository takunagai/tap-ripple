import {
  Heart,
  Music,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  speed: number
  color: string
  opacity: number
  lineWidth: number
  note: number
  size: number
  id: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface Target {
  x: number
  y: number
  radius: number
  pulse: number
}

interface GameObjects {
  ripples: Ripple[]
  particles: Particle[]
  targets: Target[]
  intersections: Map<string, boolean>
  lastTime: number
  gridPulse: number
  activeOscillators: Array<{
    oscillator: OscillatorNode
    gainNode: GainNode
    startTime: number
  }>
}

interface TouchState {
  isPressed: boolean
  startTime: number
  x: number
  y: number
  lastTapTime: number
  tapCount: number
}

type GameMode = 'zen' | 'score' | 'time'
type GameState = 'ready' | 'playing' | 'gameover'
type ScaleType = 'major' | 'minor' | 'pentatonic' | 'blues' | 'japanese'

const TapRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [gameMode, setGameMode] = useState<GameMode>('zen')
  const [gameState, setGameState] = useState<GameState>('ready')
  const [timeLeft, setTimeLeft] = useState(60)
  const [combo, setCombo] = useState(0)
  const [currentScale, setCurrentScale] = useState<ScaleType>('major')
  const [showGrid, setShowGrid] = useState(false)
  const [bpm] = useState(120)

  // グローバルスタイルを追加
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // タップ状態の管理
  const touchState = useRef<TouchState>({
    isPressed: false,
    startTime: 0,
    x: 0,
    y: 0,
    lastTapTime: 0,
    tapCount: 0,
  })

  // ゲームオブジェクト
  const gameObjects = useRef<GameObjects>({
    ripples: [],
    particles: [],
    targets: [],
    intersections: new Map(),
    lastTime: 0,
    gridPulse: 0,
    activeOscillators: [],
  })

  // 音階の定義（複数のスケール）
  const scales: Record<ScaleType, number[]> = {
    major: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25], // C Major
    minor: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25], // C Minor
    pentatonic: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], // Pentatonic
    blues: [261.63, 311.13, 349.23, 370.0, 392.0, 466.16, 523.25], // Blues
    japanese: [261.63, 277.18, 329.63, 349.23, 415.3, 523.25], // Japanese Scale
  }

  // カラーパレット
  const colors = {
    bg: '#0a0a1a',
    ripple: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'],
    particle: '#FFE66D',
    target: '#06FFA5',
    grid: '#FFFFFF15',
  }

  // オーディオコンテキストの初期化
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )()
    }
    return audioContextRef.current
  }

  // 和音生成関数
  const createChord = useCallback(
    (notes: number[]) => {
      if (!soundEnabled || notes.length === 0) return

      const audioContext = getAudioContext()
      const now = audioContext.currentTime

      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const filter = audioContext.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = note
        oscillator.type = 'sine'

        filter.type = 'lowpass'
        filter.frequency.value = 2000

        // 和音の各音に少し違うタイミングと音量を設定
        const delay = index * 0.01
        const volume = 0.3 / Math.sqrt(notes.length) // 音数が多いほど各音を小さく

        gainNode.gain.setValueAtTime(0, now + delay)
        gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 1)

        oscillator.start(now + delay)
        oscillator.stop(now + delay + 1.2)

        gameObjects.current.activeOscillators.push({
          oscillator,
          gainNode,
          startTime: now,
        })
      })
    },
    [soundEnabled],
  )

  // グリッドビート音
  const playGridBeat = useCallback(() => {
    if (!soundEnabled || !showGrid) return

    const audioContext = getAudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 880
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.05,
    )

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.05)
  }, [soundEnabled, showGrid])

  // 波紋の作成（長押し対応）
  const createRipple = (x: number, y: number, size = 1) => {
    const currentScaleNotes = scales[currentScale]
    const noteIndex = Math.floor(
      (y / canvasRef.current!.height) * currentScaleNotes.length,
    )
    const note = currentScaleNotes[currentScaleNotes.length - 1 - noteIndex] // 上が高音、下が低音

    const ripple: Ripple = {
      x,
      y,
      radius: 0,
      maxRadius: 100 + size * 100, // サイズに応じて最大半径を変更
      speed: 2,
      color: colors.ripple[Math.floor(Math.random() * colors.ripple.length)],
      opacity: 0.8,
      lineWidth: 3 + size,
      note: note,
      size: size,
      id: Date.now() + Math.random(),
    }

    gameObjects.current.ripples.push(ripple)

    // 単音を鳴らす
    createChord([note])

    // ターゲットとの衝突チェック
    if (gameMode === 'score') {
      gameObjects.current.targets.forEach((target, index) => {
        const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2)
        if (dist < 30) {
          setScore((prev) => prev + 50 * size)
          createParticles(target.x, target.y, 15)
          gameObjects.current.targets.splice(index, 1)
        }
      })
    }
  }

  // パーティクル作成
  const createParticles = (x: number, y: number, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 3
      gameObjects.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors.particle,
        size: 3 + Math.random() * 3,
      })
    }
  }

  // 波紋の交差判定（和音生成）
  const checkIntersections = () => {
    const ripples = gameObjects.current.ripples
    const currentIntersections = new Map<string, boolean>()

    for (let i = 0; i < ripples.length; i++) {
      const intersectingRipples = [ripples[i]]

      for (let j = 0; j < ripples.length; j++) {
        if (i === j) continue

        const r1 = ripples[i]
        const r2 = ripples[j]
        const dist = Math.sqrt((r1.x - r2.x) ** 2 + (r1.y - r2.y) ** 2)

        // 波紋が重なっているかチェック
        if (
          dist < r1.radius + r2.radius &&
          dist > Math.abs(r1.radius - r2.radius)
        ) {
          intersectingRipples.push(r2)
        }
      }

      if (intersectingRipples.length > 1) {
        const key = intersectingRipples
          .map((r) => r.id)
          .sort()
          .join('-')

        if (!gameObjects.current.intersections.has(key)) {
          // 新しい交差：和音を生成
          const notes = intersectingRipples.map((r) => r.note)
          const uniqueNotes = [...new Set(notes)]

          if (uniqueNotes.length > 1) {
            createChord(uniqueNotes)

            // 交差点でパーティクル生成
            const centerX =
              intersectingRipples.reduce((sum, r) => sum + r.x, 0) /
              intersectingRipples.length
            const centerY =
              intersectingRipples.reduce((sum, r) => sum + r.y, 0) /
              intersectingRipples.length
            createParticles(centerX, centerY, uniqueNotes.length * 5)

            // スコア計算
            if (gameMode !== 'zen') {
              const points = Math.pow(uniqueNotes.length, 2) * 10 // 2音=40点, 3音=90点, 4音=160点
              setScore((prev) => prev + points * (combo + 1))
              setCombo((prev) => prev + 1)
            }
          }
        }

        currentIntersections.set(key, true)
      }
    }

    // 古い交差点を削除
    gameObjects.current.intersections = currentIntersections

    // コンボリセット
    if (currentIntersections.size === 0 && combo > 0) {
      setTimeout(() => setCombo(0), 1000)
    }
  }

  // グリッドビートの処理
  useEffect(() => {
    if (!showGrid || gameState !== 'playing') return

    const beatInterval = 60000 / bpm // BPMから間隔を計算
    const timer = setInterval(() => {
      playGridBeat()
      gameObjects.current.gridPulse = 1
    }, beatInterval)

    return () => clearInterval(timer)
  }, [showGrid, gameState, bpm, playGridBeat])

  // ターゲット生成
  const spawnTarget = () => {
    if (gameMode === 'score' && gameObjects.current.targets.length < 3) {
      gameObjects.current.targets.push({
        x: 50 + Math.random() * 300,
        y: 50 + Math.random() * 500,
        radius: 25,
        pulse: 0,
      })
    }
  }

  // ゲームループ
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameState !== 'playing') return

      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      // 背景をクリア
      ctx.fillStyle = colors.bg + '40'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // グラデーション背景
      const gradient = ctx.createRadialGradient(200, 300, 0, 200, 300, 400)
      gradient.addColorStop(0, '#1a1a3a20')
      gradient.addColorStop(1, '#0a0a1a00')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // リズムグリッド描画
      if (showGrid) {
        const gridSize = 50
        ctx.strokeStyle = colors.grid
        ctx.lineWidth = 1

        // グリッドパルス効果
        if (gameObjects.current.gridPulse > 0) {
          gameObjects.current.gridPulse -= 0.05
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * gameObjects.current.gridPulse})`
          ctx.lineWidth = 2
        }

        for (let x = 0; x <= canvas.width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, canvas.height)
          ctx.stroke()
        }

        for (let y = 0; y <= canvas.height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(canvas.width, y)
          ctx.stroke()
        }

        // 音階ガイド
        const scaleNotes = scales[currentScale]
        const noteHeight = canvas.height / scaleNotes.length
        ctx.font = '12px monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'

        for (let i = 0; i < scaleNotes.length; i++) {
          const y = i * noteHeight + noteHeight / 2
          const noteNames = [
            'C',
            'C#',
            'D',
            'D#',
            'E',
            'F',
            'F#',
            'G',
            'G#',
            'A',
            'A#',
            'B',
          ]
          const noteIndex =
            Math.round(
              12 * Math.log2(scaleNotes[scaleNotes.length - 1 - i] / 261.63),
            ) % 12
          ctx.fillText(noteNames[noteIndex], 10, y)
        }
      }

      // ターゲット描画
      gameObjects.current.targets.forEach((target) => {
        target.pulse = (target.pulse + 0.05) % (Math.PI * 2)
        const pulseSize = Math.sin(target.pulse) * 5

        ctx.strokeStyle = colors.target
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(target.x, target.y, target.radius + pulseSize, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      // 波紋の更新と描画
      gameObjects.current.ripples = gameObjects.current.ripples.filter(
        (ripple) => {
          ripple.radius += ripple.speed
          ripple.opacity = Math.max(0, 1 - ripple.radius / ripple.maxRadius)

          if (ripple.opacity <= 0) return false

          // 波紋を描画
          const alpha = Math.floor(ripple.opacity * 255)
            .toString(16)
            .padStart(2, '0')
          ctx.strokeStyle = ripple.color + alpha
          ctx.lineWidth = ripple.lineWidth * ripple.opacity
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
          ctx.stroke()

          // 内側の波紋
          ctx.strokeStyle =
            ripple.color +
            Math.floor(ripple.opacity * 0.5 * 255)
              .toString(16)
              .padStart(2, '0')
          ctx.lineWidth = ripple.lineWidth * 0.5 * ripple.opacity
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2)
          ctx.stroke()

          return true
        },
      )

      // パーティクルの更新と描画
      gameObjects.current.particles = gameObjects.current.particles.filter(
        (particle) => {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.1
          particle.life -= 0.02

          if (particle.life <= 0) return false

          ctx.globalAlpha = particle.life
          ctx.fillStyle = particle.color
          ctx.fillRect(
            particle.x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size,
          )
          ctx.globalAlpha = 1

          return true
        },
      )

      // 波紋の交差チェック
      checkIntersections()

      // ターゲット生成
      if (Math.random() < 0.01) {
        spawnTarget()
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    },
    [gameState, gameMode, combo, showGrid, currentScale],
  )

  // マウス/タッチイベントハンドラー
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return

    e.preventDefault() // デフォルト動作を防ぐ

    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const now = Date.now()

    // 連続タップチェック（300ms以内）
    if (now - touchState.current.lastTapTime < 300) {
      touchState.current.tapCount++
    } else {
      touchState.current.tapCount = 1
    }

    touchState.current = {
      ...touchState.current,
      isPressed: true,
      startTime: now,
      lastTapTime: now,
      x,
      y,
    }

    // 連続タップに応じたサイズ
    const tapSize = Math.min(touchState.current.tapCount * 0.5, 3)
    createRipple(x, y, tapSize)
  }

  const handlePointerUp = () => {
    if (!touchState.current.isPressed) return

    const duration = Date.now() - touchState.current.startTime
    const size = Math.min(duration / 500, 3) // 最大3倍サイズ

    // 長押しで追加の波紋（連続タップでない場合のみ）
    if (size > 0.5 && touchState.current.tapCount === 1) {
      createRipple(touchState.current.x, touchState.current.y, size)
    }

    touchState.current.isPressed = false
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchState.current.isPressed) return

    const rect = canvasRef.current!.getBoundingClientRect()
    touchState.current.x = e.clientX - rect.left
    touchState.current.y = e.clientY - rect.top
  }

  // スケール切り替え（左右スワイプ）
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return

    const scaleNames = Object.keys(scales) as ScaleType[]
    const currentIndex = scaleNames.indexOf(currentScale)

    if (e.key === 'ArrowLeft') {
      const newIndex =
        (currentIndex - 1 + scaleNames.length) % scaleNames.length
      setCurrentScale(scaleNames[newIndex])
    } else if (e.key === 'ArrowRight') {
      const newIndex = (currentIndex + 1) % scaleNames.length
      setCurrentScale(scaleNames[newIndex])
    } else if (e.key === 'g') {
      setShowGrid(!showGrid)
    }
  }

  // ゲーム開始
  const startGame = (mode: GameMode) => {
    setGameMode(mode)
    setScore(0)
    setCombo(0)
    setTimeLeft(60)
    gameObjects.current = {
      ripples: [],
      particles: [],
      targets: [],
      intersections: new Map(),
      lastTime: 0,
      gridPulse: 0,
      activeOscillators: [],
    }
    setGameState('playing')
  }

  // タイマー処理
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'time') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('gameover')
            setHighScore(Math.max(highScore, score))
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState, gameMode, score, highScore])

  // ゲームループの開始
  useEffect(() => {
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, gameLoop])

  // キャンバス要素への参照を使ってイベントリスナーを追加
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // コンテキストメニューを無効化
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    // タッチイベントのデフォルト動作を防ぐ
    const preventDefaults = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    canvas.addEventListener('contextmenu', preventContextMenu)
    canvas.addEventListener('touchstart', preventDefaults, { passive: false })
    canvas.addEventListener('touchmove', preventDefaults, { passive: false })
    canvas.addEventListener('touchend', preventDefaults, { passive: false })

    return () => {
      canvas.removeEventListener('contextmenu', preventContextMenu)
      canvas.removeEventListener('touchstart', preventDefaults)
      canvas.removeEventListener('touchmove', preventDefaults)
      canvas.removeEventListener('touchend', preventDefaults)
    }
  }, [])

  // キーボードイベントリスナー
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScale, showGrid, gameState])

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 select-none"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" />
            Tap Ripple
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`text-white p-2 rounded-lg transition-colors ${showGrid ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
              title="Toggle Grid (G)"
            >
              <Music />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="flex gap-4 mb-4 text-white">
            {gameMode !== 'zen' && (
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
            {gameMode === 'time' && (
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
        )}

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={600}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerUp}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            className="bg-gray-900 rounded-2xl cursor-pointer border-2 border-gray-700 select-none"
            style={{
              backgroundColor: colors.bg,
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          />

          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl">
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
                  onClick={() => startGame('zen')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                >
                  <Heart size={20} />
                  禅モード（リラックス）
                </button>
                <button
                  onClick={() => startGame('score')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                >
                  <Trophy size={20} />
                  スコアアタック
                </button>
                <button
                  onClick={() => startGame('time')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                >
                  <Timer size={20} />
                  タイムチャレンジ（60秒）
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
              <p className="text-2xl text-white mb-2">Score: {score}</p>
              <p className="text-lg text-white mb-6">High Score: {highScore}</p>
              <button
                onClick={() => setGameState('ready')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors"
              >
                メニューに戻る
              </button>
            </div>
          )}
        </div>

        {gameState === 'playing' && (
          <div className="mt-4 text-white text-center">
            <p className="text-sm opacity-80">
              {gameMode === 'zen' &&
                '長押し or 連続タップで大きな波紋、重なりで和音を楽しもう'}
              {gameMode === 'score' &&
                '緑のターゲットを狙って、和音で高得点を目指そう'}
              {gameMode === 'time' && '60秒間でハイスコアを目指そう！'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TapRipple
