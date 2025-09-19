# 🚀 デプロイ手順

## 現在のデプロイ構成

- **アプリケーション**: Vercel (自動デプロイ)
- **データベース**: PostgreSQL (Supabase/Railway等)
- **音声機能**: 無効（VOICEVOXサーバー未デプロイ）

## Vercelデプロイ

### 自動デプロイ
- `develop` ブランチへのプッシュで自動デプロイ
- 環境変数はVercelダッシュボードで設定

### 必要な環境変数
```
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
LINE_CHANNEL_SECRET=your_line_secret
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_postgresql_url
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## 音声機能のデプロイ

音声機能を有効化するには、VOICEVOXサーバーを別途デプロイし、
`VOICEVOX_BASE_URL` 環境変数を設定してください。

詳細は README.md の「🎵 音声機能について」セクションを参照。