cat > docs/API_VOICE.md << 'EOF'

# 🎤 音声生成 API 仕様書

## 概要

Person B のラップテキストを VOICEVOX 音声に変換する API

## 基本情報

- **エンドポイント**: `/api/generate-voice`
- **メソッド**: POST
- **実装者**: Person D
- **利用者**: Person A (LINE 音声送信)

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
