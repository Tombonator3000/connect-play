# Mythos Quest - Voice Narration Server

This is a local TTS server that provides voice narration for the Game Master in Mythos Quest using Qwen3-TTS with voice cloning.

## Features

- 🎙️ **Voice Cloning** - Create a custom GM voice from just 3 seconds of audio
- 🔊 **High Quality** - Uses Qwen3-TTS for natural-sounding speech
- 🎮 **Game Integration** - Automatically connects to Mythos Quest
- 💾 **Caching** - Generated audio is cached for instant replay

## Quick Start

### 1. Install Python 3.12+

Download from [python.org](https://www.python.org/downloads/)

### 2. Create Virtual Environment (Recommended)

```bash
cd tts-server
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

**For NVIDIA GPU (recommended for speed):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

**For CPU only:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

### 4. (Optional) Add Reference Audio for Voice Cloning

To create a custom GM voice, add a 3-second WAV file:

1. Create folder: `mkdir reference`
2. Add your audio: `reference/gm-voice.wav`
3. The audio should be clear speech, ~3 seconds long

**Example text for reference audio:**
> "The shadows grow long as ancient evil stirs in the darkness."

You can record this yourself or use an AI voice generator to create the reference.

### 5. Start the Server

```bash
python server.py
```

The server will:
1. Download the Qwen3-TTS model on first run (~2-4 GB)
2. Load the voice cloning reference (if provided)
3. Start listening on `http://localhost:8765`

### 6. Play the Game

Open Mythos Quest in your browser. The game will automatically detect and connect to the local TTS server.

## Configuration

Edit `server.py` to change settings:

```python
@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = 8765
    model_name: str = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"  # Use 1.7B for better quality
    cache_dir: str = "./cache"
    reference_audio: str = "./reference/gm-voice.wav"
    reference_text: str = "The shadows grow long as ancient evil stirs in the darkness."
    device: str = "auto"  # "cuda", "cpu", or "auto"
```

### Model Options

| Model | Size | Quality | Speed |
|-------|------|---------|-------|
| `Qwen/Qwen3-TTS-12Hz-0.6B-Base` | ~2 GB | Good | Fast |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` | ~4 GB | Better | Slower |

## Creating Reference Audio

### Option 1: Record Yourself

Use any recording software to record a clear 3-second clip. Speak in the voice style you want the GM to use.

### Option 2: Use AI Voice Generator

1. Go to [ElevenLabs](https://elevenlabs.io/) or similar service
2. Find a mysterious/narrator voice
3. Generate the reference text
4. Download as WAV

### Option 3: Free Samples

Search for "old radio narrator" or "audiobook narrator" voice samples. Ensure you have rights to use them.

## Troubleshooting

### "No module named 'qwen_tts'"
```bash
pip install qwen-tts
```

### "CUDA out of memory"
Use the smaller model or switch to CPU:
```python
config.model_name = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"
config.device = "cpu"
```

### Game doesn't detect server
1. Check server is running on port 8765
2. Check browser console for CORS errors
3. Ensure firewall allows localhost connections

### Voice cloning not working
1. Ensure `reference/gm-voice.wav` exists
2. Check the file is a valid WAV (PCM, 16-bit)
3. Ensure the audio is clear with minimal background noise

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/synthesize` | POST | Generate speech from text |
| `/voices` | GET | List available voices |
| `/reference` | POST | Upload new reference audio |
| `/status` | GET | Detailed server status |

## System Requirements

- **CPU**: Any modern CPU (GPU recommended)
- **RAM**: 8 GB minimum, 16 GB recommended
- **GPU**: NVIDIA with 4+ GB VRAM (optional, speeds up generation)
- **Storage**: 5 GB for model cache
- **OS**: Windows 10+, macOS 10.15+, Linux

## License

The TTS server is part of Mythos Quest. Qwen3-TTS is licensed under Apache-2.0.
