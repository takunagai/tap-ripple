# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Tap Ripple (タップリップル) は React と TypeScript で構築されたインタラクティブな音楽ゲームです。画面をタップすると視覚的な波紋が生成され、音楽ノートが再生されます。波紋が重なると和音が生成されます。

## 開発コマンド

### 必須コマンド

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# コードのリント
npm run lint

# リントエラーの自動修正
npm run lint:fix

# コードのフォーマット
npm run format

# プロダクションビルドのプレビュー
npm run preview
```

### 重要事項

- このプロジェクトは ESLint の代わりに **Biome** を使用してリントとフォーマットを行います
- テストフレームワークは現在設定されていません
- TypeScript は strict モードが有効になっています
- シングルページアプリケーションでルーティングはありません
- リファクタリング後、コードは論理的な単位に分割されています

## アーキテクチャ

### ファイル構造

```
src/
├── components/          # UIコンポーネント
│   ├── GameControls.tsx   # ヘッダー部分（タイトル、音楽/グリッドトグル）
│   ├── GameMenu.tsx       # ゲーム開始画面
│   ├── GameOverScreen.tsx # ゲームオーバー画面
│   └── GameStats.tsx      # スコア・コンボ・時間表示
├── constants/          # 定数定義
│   └── game.ts           # 音階、色、ゲーム設定値
├── hooks/              # カスタムフック
│   ├── useAudio.ts       # 音声生成・再生ロジック
│   ├── useGameLogic.ts   # ゲームロジック（波紋、衝突判定、スコア）
│   └── useGameRenderer.ts # Canvas描画処理
├── types/              # 型定義
│   └── game.ts           # インターフェースと型定義
└── TapRipple.tsx       # メインコンポーネント（370行）
```

### コアコンポーネント構造

メインコンポーネント `src/TapRipple.tsx` が全体を統括し、以下を管理します：

- ゲーム状態 (menu, playing, gameover)
- 3つのゲームモード (zen, score, time)
- イベントハンドリング（タッチ、マウス、キーボード）
- カスタムフックの統合
- UIコンポーネントの配置

### 主要な技術パターン

1. **パフォーマンス最適化**: React の再レンダリングを避けるため、ゲームオブジェクトに `useRef` を使用
2. **Audio Context**: ブラウザの自動再生ポリシーに準拠するための遅延初期化
3. **Canvas レンダリング**: 60fps を実現するため、requestAnimationFrame で直接 Canvas API を使用
4. **音楽システム**:
   - 5つの音階 (メジャー、マイナー、ペンタトニック、ブルース、日本音階)
   - 垂直方向の音程マッピング (上が高音、下が低音)
   - 波紋が重なった時の和音生成

### 状態管理

- ゲーム状態は React hooks で管理
- 外部の状態管理ライブラリは使用していません
- ゲームオブジェクト (波紋、パーティクル、ターゲット) はパフォーマンスのため refs に保存

### カスタマイズポイント

`src/TapRipple.tsx` 内の変更可能な主要定数：

- `scales` オブジェクト: 音階の定義 (12行目付近)
- `colors` オブジェクト: ビジュアルテーマの色 (30行目付近)
- `bpm` 定数: リズムグリッドのテンポ (デフォルト: 120)

## コードスタイル

このコードベースで作業する際は：

- `biome.json` の Biome デフォルト設定に従ってください
- Biome のデフォルトフォーマットルールが適用されます（ダブルクォート、セミコロンあり、タブインデント）
