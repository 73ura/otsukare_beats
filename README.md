# TeamA_Section8

# ディレクトリ構成
```
project-root/
├── src/
│   ├── pages/
│   │   └── api/
│   │       └── line/
│   │           └── webhook.ts       ← LINEからのWebhook受信
│   ├── lib/
│   │   ├── openai.ts                ← OpenAIラップ生成処理
│   │   ├── rhyme.ts                 ← 韻辞典API連携ロジック
│   │   ├── emotion.ts               ← 感情分析用ロジック
│   │   ├── tts.ts                   ← 音声合成API処理（Google TTSなど）
│   │   └── logger.ts                ← 共通ログ処理
│   └── utils/
│       ├── constants.ts             ← 定数・共通メッセージ
│       └── helpers.ts               ← 汎用ユーティリティ関数
├── prisma/
│   ├── schema.prisma                ← DBスキーマ
│   └── seed.ts                      ← 開発用ダミーデータ
├── public/
│   └── audio/                       ← BGMや音声ファイル置き場
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
├── tsconfig.json
└── docs/
    ├── API_SPEC.md              ← 外部APIやWebhook仕様
    ├── PROMPT_DESIGN.md         ← ラップ生成プロンプト設計
    ├── SETUP_GUIDE.md           ← 環境構築マニュアル
    ├── DEPLOY.md                ← デプロイ手順
    ├── DB_SCHEMA.md             ← スキーマ図やモデルの説明
    └── TEAM_RULES.md            ← Gitの運用ルール・コミュニケーション
    ```