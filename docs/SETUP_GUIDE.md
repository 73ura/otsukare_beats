## **🛠️ 開発環境セットアップ＆起動手順**

## ✅ 前提準備（初回のみ）
まずはプロジェクトをクローンして、環境を整えましょう！
```
git clone https://github.com/ms-engineer-bc25-06/TeamA_Section8.git

cd TeamA_Section8

npm install

// .envに必要な環境変数を記入してルート直下に配置する。

npm run dev

```


## 🐳 Dockerコンテナの起動

まずは、アプリ全体を動かすためのDocker環境を立ち上げます：

```bash
docker-compose up
```

> ※ バックエンド・フロントエンド・DB などがまとめて立ち上がります！
> 

---

## 🌐 2. Next.jsサーバの起動（必要な人のみ）

フロントエンドだけ個別で開発したい人は、

```
npm run dev
```

> http://localhost:3000 で開発中の画面が確認できます。
> 

---

## 🌉 3. ngrokの起動（担当：なみ）

> チームのWebhookテスト用にngrokトンネルを起動・管理します!
> 
> 
> チームメンバーはngrokのURLを使う必要はありません。
> 

### 🔐 [初回のみ] ngrok認証トークンの設定（各自）

みなさんがngrokのユーザーだと証明するため、ターミナルで以下のコマンドを入力してください。

このコマンドで認証トークンを設定ファイルに保存することができます！

```bash
ngrok config add-authtoken <your_token>
```

※ トークンは ngrok マイページから取得：https://dashboard.ngrok.com/get-started/your-authtoken

---

### 🚀 [毎回] ngrok起動（担当：なみ）

```bash
ngrok http 8000
```

> 8000 はWebhookサーバがListenしているポート発行されたURLをLINE Developerコンソールに貼り付ける
> 

---

## 📬 Webhook URL設定（担当：なみ）

- LINE Developers コンソールにて、Webhook URL を ngrokで発行されたURLに更新
- 例：`https://abc123.ngrok.io/webhook`