-- 開発専用ユーザー作成（広い権限付与）
-- パスワードは環境変数で設定してください
CREATE USER IF NOT EXISTS 'dev_user'@'%' IDENTIFIED BY 'your_secure_password';

-- 全データベースに対する全権限付与（開発用）
GRANT ALL PRIVILEGES ON *.* TO 'dev_user'@'%' WITH GRANT OPTION;

-- 権限を即座に反映
FLUSH PRIVILEGES;

-- 開発用データベース確実に作成
CREATE DATABASE IF NOT EXISTS rap_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- dev_userにrap_botの全権限も明示的に付与
GRANT ALL PRIVILEGES ON rap_bot.* TO 'dev_user'@'%';

FLUSH PRIVILEGES;
