/**
 * TTS Service for Mythos Quest
 *
 * Provides text-to-speech capabilities with multiple backends:
 * 1. Local Qwen3-TTS server (best quality, requires setup)
 * 2. Web Speech API fallback (works in all modern browsers)
 *
 * For voice cloning with Qwen3-TTS, users need to:
 * 1. Install Python and qwen-tts package
 * 2. Run the local TTS server
 * 3. Configure the reference audio for GM voice
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TTSConfig {
  enabled: boolean;
  provider: 'qwen-local' | 'web-speech' | 'auto';
  qwenServerUrl: string;
  voiceId: string;
  volume: number;
  rate: number; // Speech rate (0.5 - 2.0)
  pitch: number; // Pitch (0.5 - 2.0)
}

export interface TTSVoice {
  id: string;
  name: string;
  provider: 'qwen-local' | 'web-speech';
  language: string;
}

export interface TTSStatus {
  isAvailable: boolean;
  activeProvider: 'qwen-local' | 'web-speech' | 'none';
  qwenServerConnected: boolean;
  webSpeechSupported: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  error: string | null;
}

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  enabled: true,
  provider: 'auto', // Auto-detect best available
  qwenServerUrl: 'http://localhost:8765',
  voiceId: 'gm-narrator',
  volume: 0.8,
  rate: 0.9, // Slightly slower for dramatic effect
  pitch: 0.85, // Slightly lower for ominous tone
};

// GM Narrator voice settings for Qwen3-TTS
export const GM_VOICE_CONFIG = {
  // Reference audio for voice cloning (to be placed in public/audio/)
  referenceAudioPath: '/audio/gm-reference.wav',
  referenceText: 'The shadows grow long as ancient evil stirs in the darkness.',
  // Voice characteristics for Web Speech API fallback
  webSpeechPreferences: {
    preferredVoices: ['Google UK English Male', 'Microsoft David', 'Daniel'],
    lang: 'en-GB', // British English for that classic narrator feel
  },
};

// ============================================================================
// TTS SERVICE CLASS
// ============================================================================

class TTSService {
  private config: TTSConfig = DEFAULT_TTS_CONFIG;
  private status: TTSStatus = {
    isAvailable: false,
    activeProvider: 'none',
    qwenServerConnected: false,
    webSpeechSupported: false,
    isDownloading: false,
    downloadProgress: 0,
    error: null,
  };

  private audioContext: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private speechQueue: string[] = [];
  private isProcessingQueue: boolean = false;
  private webSpeechVoice: SpeechSynthesisVoice | null = null;
  private statusListeners: Set<(status: TTSStatus) => void> = new Set();

  constructor() {
    this.loadConfig();
    this.initialize();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private async initialize(): Promise<void> {
    // Check Web Speech API support
    this.status.webSpeechSupported = 'speechSynthesis' in window;

    if (this.status.webSpeechSupported) {
      // Wait for voices to load
      await this.loadWebSpeechVoices();
    }

    // Check Qwen3-TTS server connection
    await this.checkQwenServer();

    // Determine active provider
    this.determineActiveProvider();

    this.notifyStatusListeners();
  }

  private async loadWebSpeechVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.selectBestWebSpeechVoice(voices);
        resolve();
      } else {
        // Voices load asynchronously in some browsers
        speechSynthesis.onvoiceschanged = () => {
          this.selectBestWebSpeechVoice(speechSynthesis.getVoices());
          resolve();
        };
        // Timeout fallback
        setTimeout(resolve, 1000);
      }
    });
  }

  private selectBestWebSpeechVoice(voices: SpeechSynthesisVoice[]): void {
    const { preferredVoices, lang } = GM_VOICE_CONFIG.webSpeechPreferences;

    // Try to find preferred voice
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferred));
      if (voice) {
        this.webSpeechVoice = voice;
        console.log('[TTS] Selected Web Speech voice:', voice.name);
        return;
      }
    }

    // Fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      this.webSpeechVoice = englishVoice;
      console.log('[TTS] Fallback to English voice:', englishVoice.name);
      return;
    }

    // Use first available voice
    if (voices.length > 0) {
      this.webSpeechVoice = voices[0];
      console.log('[TTS] Using default voice:', voices[0].name);
    }
  }

  private async checkQwenServer(): Promise<void> {
    try {
      const response = await fetch(`${this.config.qwenServerUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        this.status.qwenServerConnected = true;
        console.log('[TTS] Qwen3-TTS server connected');
      }
    } catch {
      this.status.qwenServerConnected = false;
      console.log('[TTS] Qwen3-TTS server not available, using fallback');
    }
  }

  private determineActiveProvider(): void {
    if (this.config.provider === 'qwen-local' && this.status.qwenServerConnected) {
      this.status.activeProvider = 'qwen-local';
    } else if (this.config.provider === 'web-speech' && this.status.webSpeechSupported) {
      this.status.activeProvider = 'web-speech';
    } else if (this.config.provider === 'auto') {
      // Auto: prefer Qwen if available, fallback to Web Speech
      if (this.status.qwenServerConnected) {
        this.status.activeProvider = 'qwen-local';
      } else if (this.status.webSpeechSupported) {
        this.status.activeProvider = 'web-speech';
      } else {
        this.status.activeProvider = 'none';
      }
    } else {
      this.status.activeProvider = 'none';
    }

    this.status.isAvailable = this.status.activeProvider !== 'none';
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('mythos_tts_config');
      if (saved) {
        this.config = { ...DEFAULT_TTS_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('mythos_tts_config', JSON.stringify(this.config));
    } catch {
      // Ignore errors
    }
  }

  public updateConfig(newConfig: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.determineActiveProvider();
    this.notifyStatusListeners();
  }

  public getConfig(): TTSConfig {
    return { ...this.config };
  }

  public getStatus(): TTSStatus {
    return { ...this.status };
  }

  // ============================================================================
  // STATUS LISTENERS
  // ============================================================================

  public onStatusChange(listener: (status: TTSStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatusListeners(): void {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => listener(status));
  }

  // ============================================================================
  // SPEECH SYNTHESIS
  // ============================================================================

  /**
   * Queue text for speech synthesis.
   * The text will be spoken after any currently playing speech finishes.
   */
  public async speak(text: string): Promise<void> {
    if (!this.config.enabled || !this.status.isAvailable) {
      return;
    }

    // Clean up text for speech
    const cleanText = this.prepareTextForSpeech(text);

    // Add to queue and process
    this.speechQueue.push(cleanText);
    console.log('[TTS] Added to queue. Queue length:', this.speechQueue.length);

    // Start processing if not already processing
    if (!this.isProcessingQueue) {
      await this.processQueue();
    }
  }

  /**
   * Process the speech queue sequentially.
   * Ensures one narration finishes before the next starts.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.speechQueue.length > 0) {
      const text = this.speechQueue.shift();
      if (!text) continue;

      console.log('[TTS] Processing speech. Remaining in queue:', this.speechQueue.length);

      try {
        if (this.status.activeProvider === 'qwen-local') {
          await this.speakWithQwen(text);
        } else if (this.status.activeProvider === 'web-speech') {
          await this.speakWithWebSpeech(text);
        }
      } catch (error) {
        console.error('[TTS] Speech failed:', error);
      }
    }

    this.isProcessingQueue = false;
    console.log('[TTS] Queue processing complete');
  }

  private prepareTextForSpeech(text: string): string {
    // Remove quotes that are used for display formatting
    let clean = text.replace(/^["']|["']$/g, '');

    // Add slight pauses for dramatic effect
    clean = clean.replace(/\.\.\./g, '... ');
    clean = clean.replace(/—/g, '... ');

    return clean.trim();
  }

  private async speakWithQwen(text: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.qwenServerUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: this.config.voiceId,
          rate: this.config.rate,
          volume: this.config.volume,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS server error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      await this.playAudioBlob(audioBlob);
    } catch (error) {
      console.error('[TTS] Qwen synthesis failed:', error);
      // Fallback to Web Speech
      if (this.status.webSpeechSupported) {
        await this.speakWithWebSpeech(text);
      }
    }
  }

  private async speakWithWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (this.webSpeechVoice) {
        utterance.voice = this.webSpeechVoice;
      }

      utterance.volume = this.config.volume;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        // Don't reject on 'interrupted' errors
        if (event.error !== 'interrupted') {
          console.error('[TTS] Web Speech error:', event.error);
        }
        resolve(); // Resolve anyway to not break the queue
      };

      this.currentUtterance = utterance;
      speechSynthesis.speak(utterance);
    });
  }

  private async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.volume = this.config.volume;
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch((err) => {
        this.currentAudio = null;
        reject(err);
      });
    });
  }

  // ============================================================================
  // CONTROL METHODS
  // ============================================================================

  public stop(): void {
    // Stop Web Speech
    if (this.status.activeProvider === 'web-speech') {
      speechSynthesis.cancel();
    }
    this.currentUtterance = null;

    // Stop Qwen audio playback
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;
    }

    // Clear the queue
    this.speechQueue = [];
    this.isProcessingQueue = false;
    console.log('[TTS] Stopped and cleared queue');
  }

  public pause(): void {
    if (this.status.activeProvider === 'web-speech') {
      speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.status.activeProvider === 'web-speech') {
      speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    if (this.status.activeProvider === 'web-speech') {
      return speechSynthesis.speaking || this.isProcessingQueue;
    }
    return this.currentAudio !== null || this.isProcessingQueue;
  }

  public getQueueLength(): number {
    return this.speechQueue.length;
  }

  // ============================================================================
  // VOICE MANAGEMENT
  // ============================================================================

  public async getAvailableVoices(): Promise<TTSVoice[]> {
    const voices: TTSVoice[] = [];

    // Web Speech voices
    if (this.status.webSpeechSupported) {
      const webVoices = speechSynthesis.getVoices();
      webVoices.forEach(voice => {
        voices.push({
          id: voice.name,
          name: voice.name,
          provider: 'web-speech',
          language: voice.lang,
        });
      });
    }

    // Qwen voices (if server connected)
    if (this.status.qwenServerConnected) {
      try {
        const response = await fetch(`${this.config.qwenServerUrl}/voices`);
        if (response.ok) {
          const qwenVoices = await response.json();
          qwenVoices.forEach((voice: { id: string; name: string; lang: string }) => {
            voices.push({
              id: voice.id,
              name: voice.name,
              provider: 'qwen-local',
              language: voice.lang,
            });
          });
        }
      } catch {
        // Ignore errors
      }
    }

    return voices;
  }

  // ============================================================================
  // SERVER MANAGEMENT
  // ============================================================================

  public async reconnectQwenServer(): Promise<boolean> {
    await this.checkQwenServer();
    this.determineActiveProvider();
    this.notifyStatusListeners();
    return this.status.qwenServerConnected;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const ttsService = new TTSService();

export default ttsService;
