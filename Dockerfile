FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# Prismaスキーマをコピー
COPY prisma ./prisma/

# Prismaクライアントを生成
RUN npx prisma generate

# アプリケーションコードをコピー
COPY . .

# Next.jsアプリケーションをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# 開発環境ではnpm run dev、本番環境ではnpm startを実行
CMD ["npm", "run", "dev"]