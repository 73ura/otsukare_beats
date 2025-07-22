<!-- 外部APIやWebhook仕様 -->

### Webhook エンドポイント

```
POST /api/line/webhook
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
