# 🎤 ラップ応援ボット

ユーザーの一言や愚痴から、即興ラップ風の応援メッセージを生成する LINE ボット

## 🚀 クイックスタート

### 必要な環境

- Node.js 18+
- MySQL 8.0+
- Git

### セットアップ

```bash
git clone <repository-url>
cd rap-bot
npm install
cp .env.example .env.local
# .env.localに必要な環境変数を設定
npm run dev
```

## 📋 環境変数設定

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

## 👥 担当分担

| 担当者   | 責任範囲                 | 主要タスク                      |
| -------- | ------------------------ | ------------------------------- |
| Person A | LINE 連携 & システム基盤 | Webhook、Next.js 設定、デプロイ |
| Person B | ラップ生成ロジック       | OpenAI API、プロンプト設計      |
| Person C | 韻辞典 & DB              | 韻検索機能、データベース設計    |
| Person D | データ管理               | 履歴保存、統計機能              |

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
```

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
```

## 📡 API 仕様

### Webhook エンドポイント

```
POST /api/webhook
Content-Type: application/json

# LINE Messaging APIからのWebhook受信
```

### 内部 API

```typescript
// ラップ生成
POST /api/generate-rap
{
  "userInput": "疲れた...",
  "userId": "line_user_id"
}

// 韻検索
GET /api/rhyme?word=疲れた

// 履歴取得
GET /api/history?userId=line_user_id
```

## 🧪 テスト

```bash
# 単体テスト
npm run test

# LINE Webhook テスト用JSON
{
  "events": [{
    "type": "message",
    "message": {
      "type": "text",
      "text": "疲れた..."
    },
    "source": {
      "userId": "test_user_id"
    }
  }]
}
```

## 📦 使用技術

- **フロントエンド**: Next.js 14 (TypeScript)
- **バックエンド**: Next.js API Routes
- **データベース**: MySQL + Prisma ORM
- **外部 API**:
  - LINE Messaging API
  - OpenAI API
  - 韻辞典 API (調査中)
- **デプロイ**: Vercel
- **データベースホスティング**: Railway/PlanetScale

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

1. **ブランチ戦略**: `main` ← `develop` ← `feature/xxx`
2. **コミット**: 英語 or 日本語 OK（統一する）
3. **PR**: 最低 1 人のレビュー必須
4. **定期 MTG**: 週 2 回、進捗共有

## 📚 参考資料

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [OpenAI API ドキュメント](https://platform.openai.com/docs)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)

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
