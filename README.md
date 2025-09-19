# 🎤 ラップで応援ボット「おつかれビーツ」

ユーザーの一言や愚痴から、即興ラップ風の応援メッセージを生成する LINE ボット

## 🚀 クイックスタート

詳細なセットアップ手順は [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) を参照してください。

## 📁 ディレクトリ構成

```
├── docs/                    # ドキュメント
├── prisma/                  # データベース設定
├── public/audio/            # 音声ファイル
├── src/
│   ├── lib/                 # 共通ライブラリ
│   ├── pages/api/           # APIエンドポイント
│   └── types/               # 型定義
├── docker/                  # Docker設定
├── compose.yml              # 開発環境
└── package.json             # 依存関係
```

## 🚀 機能

**入力**: 「疲れた...」  
**出力**: 韻を踏んだ応援ラップ + 音声メッセージ（ローカル環境のみ）

## 📦 使用技術

- **Next.js 14** (TypeScript)
- **OpenAI API** (ラップ生成)
- **VOICEVOX** (音声合成)
- **PostgreSQL + Prisma** (データベース)
- **LINE Messaging API** (チャットボット)

## 📚 詳細ドキュメント

- [🛠️ セットアップ手順](docs/SETUP_GUIDE.md)
- [🚀 デプロイ方法](docs/DEPLOY.md)
- [📡 API仕様](docs/API_SPEC.md)
- [🎯 プロンプト設計](docs/PROMPT_DESIGN.md)
- [📊 DB設計](docs/DB_SCHEMA.md)
- [🤝 開発ルール](docs/TEAM_RULES.md)

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
