import type { NextApiRequest, NextApiResponse } from "next";
import { generateVoiceWithGoogleTTS } from "../../lib/fallback-tts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;
    const testText = text || "これはLINE音声デバッグテストです。";

    console.log(`🔍 Starting LINE audio debug for: "${testText}"`);

    // 1. 音声生成
    const { audioId, audioUrl, duration } = await generateVoiceWithGoogleTTS(testText, 'female');
    console.log(`🎵 Audio generated: ID=${audioId}, URL=${audioUrl}`);

    // 2. 生成されたURLに直接アクセスしてテスト
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioSize = audioBuffer.byteLength;

    console.log(`📊 Audio response details:
      - Status: ${audioResponse.status}
      - Size: ${audioSize} bytes
      - Content-Type: ${audioResponse.headers.get('content-type')}
      - Content-Length: ${audioResponse.headers.get('content-length')}
    `);

    // 3. WAVファイルのヘッダーを解析
    const headerBuffer = new Uint8Array(audioBuffer, 0, 44);
    const headerAnalysis = analyzeWavHeader(headerBuffer);

    // 4. LINEの要件チェック
    const lineRequirements = checkLineRequirements(audioUrl, audioResponse.headers, audioSize);

    res.status(200).json({
      success: true,
      debug: {
        audioId,
        audioUrl,
        duration,
        response: {
          status: audioResponse.status,
          size: audioSize,
          headers: Object.fromEntries(audioResponse.headers.entries())
        },
        wavHeader: headerAnalysis,
        lineRequirements,
        testInstructions: [
          "1. Copy audioUrl and test in browser",
          "2. Check if audio plays in browser",
          "3. If browser works but LINE doesn't, it's LINE-specific issue",
          "4. Check lineRequirements for compliance issues"
        ]
      }
    });

  } catch (error) {
    console.error("🚨 LINE audio debug error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

function analyzeWavHeader(header: Uint8Array) {
  const decoder = new TextDecoder();
  
  return {
    riffSignature: decoder.decode(header.slice(0, 4)),
    fileSize: new DataView(header.buffer, header.byteOffset).getUint32(4, true),
    waveSignature: decoder.decode(header.slice(8, 12)),
    fmtSignature: decoder.decode(header.slice(12, 16)),
    fmtSize: new DataView(header.buffer, header.byteOffset).getUint32(16, true),
    audioFormat: new DataView(header.buffer, header.byteOffset).getUint16(20, true),
    channels: new DataView(header.buffer, header.byteOffset).getUint16(22, true),
    sampleRate: new DataView(header.buffer, header.byteOffset).getUint32(24, true),
    byteRate: new DataView(header.buffer, header.byteOffset).getUint32(28, true),
    blockAlign: new DataView(header.buffer, header.byteOffset).getUint16(32, true),
    bitsPerSample: new DataView(header.buffer, header.byteOffset).getUint16(34, true),
    dataSignature: decoder.decode(header.slice(36, 40)),
    dataSize: new DataView(header.buffer, header.byteOffset).getUint32(40, true),
  };
}

function checkLineRequirements(url: string, headers: Headers, size: number) {
  return {
    httpsUrl: url.startsWith('https://'),
    contentType: headers.get('content-type'),
    contentLength: headers.get('content-length'),
    acceptRanges: headers.get('accept-ranges'),
    fileSize: size,
    sizeWithinLimit: size <= 10 * 1024 * 1024, // 10MB limit
    recommendations: {
      format: 'M4A (AAC) is preferred by LINE',
      duration: 'Should be under 60 seconds',
      bitrate: '128kbps or lower recommended',
      sampleRate: '44.1kHz or 16kHz recommended'
    }
  };
}
