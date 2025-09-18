// 音声生成APIの型定義

export interface VoicevoxAudioQuery {
  accent_phrases: AccentPhrase[];
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
  prePhonemeLength: number;
  postPhonemeLength: number;
  outputSamplingRate: number;
  outputStereo: boolean;
  kana: string;
}

export interface VoiceGenerationRequest {
  text: string;
  speaker: number;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface VoiceGenerationResponse {
  success: boolean;
  audioUrl?: string;
  fileName?: string;
  message: string;
  error?: string;
}

export interface AccentPhrase {
  moras: Mora[];
  accent: number;
  pause_mora?: Mora;
  is_interrogative?: boolean;
}

export interface Mora {
  text: string;
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
  pitch: number;
}

export interface VoicevoxSpeaker {
  name: string;
  speaker_uuid: string;
  styles: VoicevoxStyle[];
  version: string;
}

export interface VoicevoxStyle {
  name: string;
  id: number;
  type: string;
}
