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

// 音声生成
POST /api/generate-voice
{
"text": "疲れた君だけど頑張ってるよ",
"speaker": 3,
"speed": 1.0, // 任意
"pitch": 0.0, // 任意  
 "volume": 1.0 // 任意
}

// レスポンス
{
"success": true,
"audioUrl": "/audio/voice_xxx.wav",
"fileName": "voice_xxx.wav",
"message": "Voice generated successfully"
}

// Person A 連携用
// 音声ファイル保存先: public/audio/${fileName}
// 対応スピーカー: 1-109 (ずんだもん:1, 四国めたん:2, 玄野武宏:11)
