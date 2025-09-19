# 🎤 音声生成 API 仕様書

## 概要

ラップテキストを VOICEVOX 音声に変換する API

## 基本情報

- **エンドポイント**: `/api/generate-voice`
- **メソッド**: POST
- **音声エンジン**: VOICEVOX
- **利用者**: LINE Webhook, 外部クライアント

## リクエスト仕様

```json
{
  "text": "string (必須, 500文字以内)",
  "speaker": "number (必須, 1-109)",
  "speed": "number (任意, デフォルト1.0)",
  "pitch": "number (任意, デフォルト0.0)",
  "volume": "number (任意, デフォルト1.0)"
}
```

## レスポンス仕様

```json
{
  "success": true,
  "audioUrl": "/audio/voice_2025-09-19T01-23-45-123Z_abc123.wav",
  "fileName": "voice_2025-09-19T01-23-45-123Z_abc123.wav",
  "message": "Voice generated successfully"
}
```

## 推奨スピーカー

- **3**: ずんだもん（ノーマル） - 推奨
- **2**: 四国めたん（あまあま）
- **11**: 玄野武宏（ノーマル）

## 注意事項

- **本番環境**: VOICEVOXサーバーが必要（現在は無効）
- **ローカル環境**: `http://localhost:50021` でVOICEVOXが動作している必要がある
- **エラー時**: 500エラーとエラーメッセージを返す
