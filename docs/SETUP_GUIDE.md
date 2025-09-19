# 🛠️ 開発環境セットアップガイド

## 📋 前提条件

- Node.js 18+
- Git
- Docker (音声機能を使用する場合)

## 🚀 クイックスタート

### 1. プロジェクトのクローン
```bash
git clone https://github.com/73ura/otsukare_beats.git
cd otsukare_beats
npm install
```

### 2. 環境変数の設定
```bash
# .env.local ファイルを作成
cp .env.example .env.local

### 3. データベースの設定
```bash
# Prisma クライアント生成
npx prisma generate

# データベースにスキーマを適用
npx prisma db push
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します。

## 🎵 音声機能の有効化（オプション）

### ローカル開発で音声機能を使用する場合

```bash
# VOICEVOXサーバーをDockerで起動
docker compose up voicevox -d

# アプリケーションを起動
npm run dev
```

VOICEVOXサーバーが http://localhost:50021 で起動し、音声生成が可能になります。

## 📡 LINE Webhook設定

### 本番環境（Vercel）
1. Vercelでデプロイ完了後のURLを取得
2. LINE Developers コンソールでWebhook URLを設定
3. URL例：`https://your-app.vercel.app/api/line/webhook`

### ローカルテスト（ngrok使用）
```bash
# ngrokでローカルサーバーを公開
ngrok http 3000

# 発行されたURLをLINE Developersで設定
# 例：https://abc123.ngrok-free.app/api/line/webhook
```