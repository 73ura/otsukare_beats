<!-- DBのスキーマ図やモデルの説明 -->

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