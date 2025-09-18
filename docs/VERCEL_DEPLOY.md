# Vercel 無料デプロイガイド

このガイドでは、ラップ応援ボットをVercelで無料デプロイする手順を説明します。

## 🎯 構成

- **フロントエンド/API**: Vercel (無料プラン)
- **データベース**: Supabase (PostgreSQL、無料プラン)
- **制限**: 
  - Vercel: 月100GB帯域幅、100GB-hours実行時間
  - Supabase: 500MB DB、2GB帯域幅

## 📋 事前準備

### 1. アカウント作成
- [Vercel](https://vercel.com) アカウント作成
- [Supabase](https://supabase.com) アカウント作成
- GitHubリポジトリの準備

### 2. 環境変数の確認
以下の環境変数が必要です：
```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
LINE_CHANNEL_SECRET=your_line_secret

# OpenAI API
OPENAI_API_KEY=your_openai_key

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# その他
NODE_ENV=production
```

## 🗄️ データベース設定 (Supabase)

### 1. Supabaseプロジェクト作成
1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. "New Project" をクリック
3. プロジェクト名を入力（例: `rap-bot-db`）
4. データベースパスワードを設定
5. リージョンを選択（日本なら Northeast Asia）

### 2. データベース接続情報取得
1. プロジェクトダッシュボードで "Settings" > "Database"
2. "Connection string" の "URI" をコピー
3. これが `DATABASE_URL` になります

### 3. Prismaスキーマ更新
現在のMySQLスキーマをPostgreSQLに変更：

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // mysql から変更
  url      = env("DATABASE_URL")
}

model sqlusers {
  id          Int       @id @default(autoincrement())
  line_user_id String    @unique
  created_at  DateTime  @default(now())
  messages    messages[]
}

model messages {
  id             Int      @id @default(autoincrement())
  user           sqlusers @relation(fields: [user_id], references: [id])
  user_id        Int
  input_text     String
  generated_rap  String
  created_at     DateTime @default(now())
}

model rap_patterns {
  id           Int      @id @default(autoincrement())
  pattern      String
  success_rate Float?
  usage_count  Int      @default(0)
}
```

## 🚀 Vercelデプロイ手順

### 1. GitHubリポジトリ準備
```bash
# リポジトリをGitHubにプッシュ
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Vercelプロジェクト作成
1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. "New Project" をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (デフォルト)

### 3. 環境変数設定
Vercelダッシュボードで：
1. プロジェクト > "Settings" > "Environment Variables"
2. 以下の環境変数を追加：

```
LINE_CHANNEL_ACCESS_TOKEN = your_actual_token
LINE_CHANNEL_SECRET = your_actual_secret
OPENAI_API_KEY = your_actual_key
DATABASE_URL = your_supabase_connection_string
NODE_ENV = production
```

### 4. データベースマイグレーション
ローカルで実行：
```bash
# Supabase接続文字列を.envに設定
echo "DATABASE_URL=your_supabase_url" > .env

# Prismaクライアント生成
npx prisma generate

# データベーススキーマ適用
npx prisma db push
```

### 5. デプロイ実行
1. Vercelで "Deploy" ボタンをクリック
2. ビルドが成功すると、デプロイ完了
3. 提供されたURLをメモ（例: `https://your-app.vercel.app`）

## 🔗 LINE Webhook設定

### 1. LINE Developer Console設定
1. [LINE Developer Console](https://developers.line.biz/console/) にログイン
2. チャンネル設定で "Webhook URL" を更新：
   ```
   https://your-app.vercel.app/api/line/webhook
   ```
3. "Webhook の利用" を有効化

### 2. 動作テスト
1. LINEボットにメッセージを送信
2. Vercelの "Functions" タブでログ確認
3. エラーがあれば環境変数を再確認

## 🔧 トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```bash
   # ローカルでビルドテスト
   npm run build
   ```

2. **データベース接続エラー**
   - DATABASE_URLが正しいか確認
   - Supabaseプロジェクトが起動しているか確認

3. **環境変数エラー**
   - Vercelの環境変数設定を再確認
   - 再デプロイが必要な場合あり

4. **LINE Webhook エラー**
   - URLが正しいか確認（https必須）
   - SSL証明書エラーがないか確認

## 📊 無料プラン制限

### Vercel制限
- 月100GB帯域幅
- 100GB-hours実行時間
- 同時ビルド1つ

### Supabase制限  
- 500MBデータベース
- 月2GB帯域幅
- 50,000リクエスト/月

### 制限対策
- 画像/音声ファイルは外部ストレージ利用
- ログレベル調整でDB使用量削減
- キャッシュ活用でAPI呼び出し削減

## 🎉 デプロイ完了後

1. **動作確認**
   - LINEボットでメッセージ送信テスト
   - 各API機能の動作確認

2. **監視設定**
   - Vercelの Analytics 確認
   - Supabaseの使用量監視

3. **継続的デプロイ**
   - GitHubにプッシュすると自動デプロイ
   - プレビューデプロイも利用可能

---

これで無料でのデプロイが完了です！🎉
