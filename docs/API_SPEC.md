# 🚀 API仕様書

## Webhook エンドポイント

### LINE Webhook
```
POST /api/line/webhook
Content-Type: application/json

# LINE Messaging APIからのWebhook受信
# ユーザーメッセージ → ラップ生成 → 音声生成 → LINE返信
```

## 内部 API

### 音声生成API
```typescript
POST /api/generate-voice
{
  "text": "疲れた君だけど頑張ってるよ",
  "speaker": 3,
  "speed": 1.0,    // 任意, デフォルト1.0
  "pitch": 0.0,    // 任意, デフォルト0.0  
  "volume": 1.0    // 任意, デフォルト1.0
}

// レスポンス
{
  "success": true,
  "audioUrl": "/audio/voice_xxx.wav",
  "fileName": "voice_xxx.wav",
  "message": "Voice generated successfully"
}
```

### メッセージ履歴API
```typescript
// メッセージ保存
POST /api/messages
{
  "line_user_id": "U1234567890",
  "input_text": "疲れた...",
  "generated_rap": "疲れた君だけど..."
}

// メッセージ履歴取得
GET /api/messages?line_user_id=U1234567890
```

### OpenAIテストAPI
```typescript
POST /api/test-openai
{
  "message": "疲れた..."
}

// レスポンス
{
  "rap": "生成されたラップテキスト"
}
```

## 技術仕様

- **音声ファイル保存先**: `public/audio/${fileName}`
- **対応スピーカー**: 1-109 (ずんだもん:3, 四国めたん:2, 玄野武宏:11)
- **音声形式**: WAV (VOICEVOX生成)
- **文字数制限**: 500文字以内
