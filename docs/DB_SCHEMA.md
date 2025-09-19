# 📊 データベース設計書

## 概要

PostgreSQL + Prisma ORM を使用したデータベース設計

## スキーマ定義

### sqlusers テーブル
```sql
-- LINEユーザー管理
CREATE TABLE sqlusers (
  id SERIAL PRIMARY KEY,
  line_user_id VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### messages テーブル
```sql
-- メッセージ履歴
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES sqlusers(id),
  input_text VARCHAR NOT NULL,
  generated_rap VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### rap_patterns テーブル
```sql
-- ラップパターン分析（将来用）
CREATE TABLE rap_patterns (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR NOT NULL,
  success_rate DECIMAL,
  usage_count INTEGER DEFAULT 0
);
```

## Prismaスキーマ

実際のスキーマ定義は `prisma/schema.prisma` を参照してください。

## データベース操作

```bash
# マイグレーション実行
npx prisma db push

# Prisma Client生成
npx prisma generate

# データベース管理画面
npx prisma studio
```