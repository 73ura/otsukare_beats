# 🎤 ラップで応援ボット「おつかれビーツ」

ユーザーの一言や愚痴から、即興ラップ風の応援メッセージを生成する LINE ボット

## 🚀 クイックスタート

### 必要な環境

- Node.js 18+
- MySQL 8.0+
- Git

### セットアップ

詳細は SETUP_GUIDE.md に記載してあります。

## 📁 ディレクトリ構成

```
project-root/
├── .github/                    
│   └── pull_request_template.md   # PR時のテンプレート
├── docker/
│   └── mysql/
│       └── init.sql              # MySQL初期データ投入用SQL
├── docs/
│   ├── API_SPEC.md               # APIエンドポイント仕様
│   ├── API_VOICE.md              # 音声API仕様
│   ├── DB_SCHEMA.md              # DB設計・ER図・説明
│   ├── DEPLOY.md                 # デプロイ手順・本番運用メモ
│   ├── PROMPT_DESIGN.md          # OpenAI用プロンプト設計例
│   ├── SETUP_GUIDE.md            # 環境構築・起動方法
│   └── TEAM_RULES.md             # Git・チーム運用ルール
├── node_modules/                 # (自動生成) npmパッケージ
├── prisma/
│   ├── migrations/               # Prisma用マイグレーション履歴
│   │   └── ... 
│   ├── schema.prisma             # DBスキーマ定義（最重要）
│   ├── seed.ts                   # 開発用テストデータ投入スクリプト
│   └── migration_lock.toml
├── public/
│   └── audio/                    # 公開用の音声ファイル/BGM
├── src/
│   ├── lib/
│   │   ├── logger.ts             # 共通ロガー
│   │   ├── openai.ts             # OpenAI APIラップ生成
│   │   ├── prisma.ts             # Prismaクライアント
│   │   └── voicevox.ts           # VOICEVOX APIラッパー
│   ├── pages/
│   │   ├── api/
│   │   │   ├── generate-voice.ts        # 音声生成API
│   │   │   ├── line/
│   │   │   │   ├── webhook.ts           # LINE Webhook受信メイン
│   │   │   │   └── webhook.ts.backup    # 旧Webhook実装
│   │   │   ├── messages.ts              # 応答メッセージ管理
│   │   │   └── test-openai.ts           # OpenAIテストAPI
│   │   ├── error.tsx
│   │   ├── index.tsx
│   │   └── types/
│   │       └── voice.ts                 # 型定義
├── .env                                # 環境変数(本番・開発)
├── .env.example                        # 環境変数ひな型
├── .eslintrc.json                      # Lintルール
├── .gitignore
├── .prettierrc                         # フォーマッタ
├── compose.prod.yml                    # 本番用docker-compose
├── compose.yml                         # 開発用docker-compose  
├── Dockerfile                          # Dockerビルド定義
├── next.config.js                      # Next.js設定
├── next-env.d.ts                       # Next.js型定義
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json                       # TypeScript設定
```

## 📋 環境変数設定

例として.env.example を用意してあります。
各自のローカルで.env ファイルを用意して、中に秘密の情報を書き込んで使ってください。

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
LINE_CHANNEL_SECRET=your_line_secret

# OpenAI API
OPENAI_API_KEY=your_openai_key

# 韻辞典API
RHYME_API_KEY=your_rhyme_api_key
RHYME_API_URL=https://api.example.com

# Database
DATABASE_URL=mysql://username:password@localhost:3306/rap_bot

# その他
NODE_ENV=development
NEXTAUTH_SECRET=your_secret_key
```

## 🏗 システム構成

```
LINE → Next.js API Routes → OpenAI + 韻辞典API → MySQL
```

## 📌 アーキテクチャ図（処理フロー）

````text
ユーザー
   │
   ▼
① LINEメッセージ送信
   │
   ▼
LINEプラットフォーム（Messaging API）
   │
   └───▶ ② Webhook通知
                 （Next.js: /api/line/webhook.ts）
                      │
                      ├─▶ ③ OpenAI API呼び出し
                      │       └ 入力メッセージからラップを生成 🎤
                      │
                      ├─▶ ④ Voicevox で音声変換（mp3）
                      │
                      ├─▶ ⑤ LINE返信用メッセージ構築
                      │
                      └─▶ ⑥ LINE Messaging API に返信送信
   ▼
ユーザーのLINEにラップが届く！


## 👥 担当分担
| 担当者     | 責任範囲                      | 主要タスク                                 |
| ---------- | ----------------------------- | ------------------------------------------ |
| なみさんA  | LINE統合 & システム基盤        | LINE Webhook設計・Next.js API連携・デプロイ|
| きょんさんB| OpenAI & ラップ生成エンジン    | OpenAI API統合・プロンプト設計・応答調整   |
| しずかさんC| データベース & バックエンド    | Prisma/DB設計・ユーザー管理・APIロジック   |
| りょうこD  | 音声機能 & DevOps・セキュリティ| 音声合成API・本番環境構築・運用・監視      |

## 👤 作業見積もり（優先度順）
### なみさんA：LINE統合 & システム基盤（15h）

| 優先度 | タスク | 工数 | 概要 |
| ------ | ------ | ---- | ---- |
| ◎ | LINE Messaging API統合 | 5h | LINEボットの送受信、基本動作 |
| ◎ | Next.js API/Webhook連携 | 4h | Webhook/APIルート設計 |
| ○ | エラーハンドリング・ログ設計 | 3h | システム安定性UP、トラブル対応 |
| △ | チームサポート・最終調整 | 3h | 他API連携支援・最終チェック |
---
### きょんさんB：OpenAI & ラップ生成エンジン（15h）

| 優先度 | タスク | 工数 | 概要 |
| ------ | ------ | ---- | ---- |
| ◎ | OpenAI API統合・基本設定 | 3h | GPT-4等のAPI接続・初期設定 |
| ◎ | 韻を踏むプロンプト設計 | 8h | 日本語応援ラップのPrompt設計 |
| ○ | 応答品質テスト・パターン調整 | 2h | ラップ生成のテストと調整 |
| △ | LINE応答体験最適化 | 2h | UI/UX強化（返信形式改善など） |
---
### しづかさんC：データベース & バックエンド（15h）

| 優先度 | タスク | 工数 | 概要 |
| ------ | ------ | ---- | ---- |
| ◎ | Prisma設定・スキーマ設計 | 4h | MySQL/PrismaによるDB設計 |
| ◎ | ユーザー管理・履歴保存 | 5h | LINEユーザー/履歴保存実装 |
| ○ | パターン分析・データ管理 | 3h | ラップパターン・実績管理 |
| △ | API設計・バックエンド最適化 | 3h | Next.js API/サーバー改善 |
---
### りょうこさんD：音声機能 & DevOps・セキュリティ（15h）

| 優先度 | タスク | 工数 | 概要 |
| ------ | ------ | ---- | ---- |
| ◎ | 音声合成API連携 | 6h | 生成ラップの音声化API（SoundBox等） |
| ◎ | 本番デプロイ設定（Docker等） | 4h | 本番環境/CI/CD/Docker対応 |
| ○ | APIキー管理・セキュリティ | 2h | .env管理/アクセス制御 |
| △ | 統合テスト・運用監視 | 3h | 統合テスト/稼働監視 |
---

## 🗃 データベース設計
```sql
-- ユーザー管理
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,  -- LINE user_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- メッセージ履歴
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  input_text TEXT,
  generated_rap TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
````
## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# データベース操作
npx prisma db push
npx prisma generate
npx prisma studio

# 型チェック
npm run type-check

# デプロイ
npm run build

# Docker環境
docker compose up -d
```

## 📡 API 仕様

API 仕様の詳細は [docs/API_SPEC.md](docs/API_SPEC.md) に記載しています。

### 主要 API

- **Webhook**: LINE Messaging API 受信
- **ラップ生成**: OpenAI 統合
- **音声生成**: VOICEVOX 統合 ← 新規追加
- **履歴管理**: データベース操作

## 🧪 テスト

```bash
# 単体テスト
npm run test

# Docker環境起動
docker compose up -d

# MySQL単体起動
docker compose up mysql -d

# 開発環境（Prisma Studio含む）
docker compose --profile dev up -d
```

## 📦 使用技術

- **フロントエンド**: Next.js 14 (TypeScript)
- **バックエンド**: Next.js API Routes
- **データベース**: MySQL + Prisma ORM
- **外部 API**:
  - LINE Messaging API
  - OpenAI API
  - 韻辞典 API (調査中)
  - Google TTS API (音声合成)
- **デプロイ**: Vercel
- **データベースホスティング**: Railway/PlanetScale
- **コンテナ**: Docker + Docker Compose

## 🚧 開発進捗

- [ ] LINE Messaging API 基本連携
- [ ] Next.js 基盤構築
- [ ] OpenAI API 統合
- [ ] 韻辞典 API 調査・実装
- [ ] データベース設計・実装
- [ ] MVP 版リリース

## 🔥 MVP 機能

**入力**: 「疲れた...」  
**出力**: 「疲れたって言うけれど / 頑張ってるキミは偉い / 休憩も大事だぜ」（韻を踏んだ応援ラップ）

## 🤝 開発ルール

詳細は TEAM_RULES.md に記載してあります。

## ✏️ コーディング規約

### 📌 ファイル構成と命名

- ディレクトリ名・ファイル名：すべて **kebab-case**
  - 例: `user-profile.ts`, `generate-rap.tsx`
- React コンポーネント：PascalCase
  - 例: `RapCard.tsx`, `LineMessageForm.tsx`

### 💡 TypeScript

- 型定義は可能な限り明示的に記述
- `any` の使用は禁止（やむを得ない場合は `// FIXME` コメントをつける）

### 🧼 Lint & フォーマット

- `ESLint` + `Prettier` による自動整形を導入済み
- 保存時に自動整形がかかるように VS Code 設定推奨
  - `.vscode/settings.json` 例：
    ```json
    {
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      }
    }
    ```

### 💬 コメント・ログ

- 日本語または英語どちらでも OK（チーム内で統一）
- `console.log` は開発中のみ。**本番前に削除 or logger に置換**
- 必要な関数には JSDoc コメントをつける

### 🧪 テスト

- テストコードは `__tests__` ディレクトリ配下に配置
- ファイル名に `.test.ts` / `.test.tsx` を付ける

---

より詳細なルールは [docs/TEAM_RULES.md](docs/TEAM_RULES.md) に記載

## 📚 ドキュメント

- [API 仕様書](docs/API_SPEC.md)
- [環境構築ガイド](docs/SETUP_GUIDE.md)
- [デプロイ手順](docs/DEPLOY.md)
- [DB 設計書](docs/DB_SCHEMA.md)
- [プロンプト設計](docs/PROMPT_DESIGN.md)
- [音声生成 API 仕様](docs/API_VOICE.md)

## 📚 参考資料

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [OpenAI API ドキュメント](https://platform.openai.com/docs)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)

## 🎵 音声機能について

### 現在の状況
- **実装状況**: VOICEVOX音声合成機能は実装済み
- **動作環境**: ローカル開発環境でのみ動作
- **本番環境**: 予算の都合でVOICEVOXサーバーをデプロイしていないため音声機能は無効

### 音声機能を有効化する方法

音声機能を本番環境で使用する場合は、以下のいずれかのサーバーでVOICEVOXをホスティングする：

#### 🚀 推奨ホスティングサービス

| サービス | 月額費用 | メモリ | 特徴 |
|---------|----------|--------|------|
| **Railway** | $5〜 | 1GB〜 | 高速、簡単デプロイ |
| **Render.com** | $7〜 | 512MB〜 | 安定、自動スケール |
| **Google Cloud Run** | $10〜 | 1GB〜 | 従量課金、高性能 |
| **AWS ECS** | $15〜 | 1GB〜 | 本格運用向け |

#### 🔧 デプロイ手順

1. **Dockerファイル使用**: プロジェクト内の `compose.yml` を参考
2. **環境変数設定**: `VOICEVOX_BASE_URL` にデプロイしたサーバーのURLを設定
3. **Vercel再デプロイ**: 環境変数更新後に自動デプロイ

#### 📁 関連ファイル

音声機能の実装は以下のファイルに含まれています：
- `src/lib/voicevox.ts` - VOICEVOX API連携
- `src/pages/api/generate-voice.ts` - 音声生成エンドポイント
- `src/pages/api/line/webhook.ts` - LINE音声メッセージ送信
- `compose.yml` / `compose.prod.yml` - Docker設定

### 代替案

予算を抑えたい場合の代替音声サービス：
- **Google Cloud Text-to-Speech**: 月400万文字無料
- **AWS Polly**: 月500万文字無料
- **Azure Speech Services**: 月50万文字無料

実装例は過去のコミット履歴から参照可能です。

## 🆘 トラブルシューティング

### よくある問題

1. **LINE Webhook が反応しない**

   - デプロイ済み URL を確認
   - 環境変数が正しく設定されているか確認

2. **OpenAI API でエラー**

   - API キーの有効性を確認
   - レート制限に注意

3. **DB 接続エラー**
   - DATABASE_URL を確認
   - `npx prisma db push` 実行済みか確認

4. **音声機能が動作しない**
   - VOICEVOXサーバーが起動しているか確認
   - `VOICEVOX_BASE_URL` 環境変数を確認
   - ローカル: `http://localhost:50021`
   - 本番: デプロイしたVOICEVOXサーバーのURL
