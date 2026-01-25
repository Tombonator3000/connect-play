#!/usr/bin/env python3
"""
Qwen3-TTS Local Server for Mythos Quest

This server provides a REST API for text-to-speech synthesis using Qwen3-TTS
with voice cloning capabilities. It's designed to work with the Mythos Quest
game for Game Master narration.

Usage:
    1. Install dependencies: pip install -r requirements.txt
    2. Run server: python server.py
    3. The game will automatically connect to http://localhost:8765

The server will automatically download the Qwen3-TTS model on first run (~4GB).
"""

import os
import io
import json
import wave
import hashlib
import logging
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for game frontend

# ============================================================================
# CONFIGURATION
# ============================================================================

@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = 8765
    model_name: str = "Qwen/Qwen3-TTS-12Hz-0.6B-Base"  # Smaller model for faster inference
    cache_dir: str = "./cache"
    reference_audio: str = "./reference/gm-voice.wav"
    reference_text: str = "The shadows grow long as ancient evil stirs in the darkness."
    device: str = "auto"  # "cuda", "cpu", or "auto"


config = ServerConfig()

# ============================================================================
# TTS ENGINE (Lazy loaded)
# ============================================================================

class TTSEngine:
    def __init__(self):
        self.model = None
        self.voice_prompt = None
        self.audio_cache = {}
        self._initialized = False
        self._download_progress = 0

    def initialize(self):
        """Initialize the TTS model. Called on first request."""
        if self._initialized:
            return

        logger.info("Initializing Qwen3-TTS engine...")
        logger.info(f"Loading model: {config.model_name}")

        try:
            from qwen_tts import QwenTTS

            # Determine device
            device = config.device
            if device == "auto":
                import torch
                device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Using device: {device}")

            # Load model (this downloads if not cached)
            self.model = QwenTTS.from_pretrained(
                config.model_name,
                device=device
            )

            # Create cache directory
            Path(config.cache_dir).mkdir(parents=True, exist_ok=True)

            # Load voice cloning prompt if reference audio exists
            self._load_voice_prompt()

            self._initialized = True
            logger.info("TTS engine initialized successfully!")

        except ImportError as e:
            logger.error(f"Failed to import qwen_tts: {e}")
            logger.error("Please install: pip install qwen-tts")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize TTS engine: {e}")
            raise

    def _load_voice_prompt(self):
        """Load or create voice cloning prompt from reference audio."""
        ref_path = Path(config.reference_audio)

        if not ref_path.exists():
            logger.warning(f"Reference audio not found: {ref_path}")
            logger.warning("Voice cloning disabled. Using default voice.")
            return

        try:
            logger.info(f"Creating voice prompt from: {ref_path}")
            self.voice_prompt = self.model.create_voice_clone_prompt(
                ref_audio=str(ref_path),
                ref_text=config.reference_text
            )
            logger.info("Voice cloning prompt created successfully!")
        except Exception as e:
            logger.error(f"Failed to create voice prompt: {e}")
            self.voice_prompt = None

    def synthesize(self, text: str, rate: float = 1.0) -> bytes:
        """Synthesize speech from text."""
        if not self._initialized:
            self.initialize()

        # Check cache
        cache_key = self._get_cache_key(text, rate)
        if cache_key in self.audio_cache:
            logger.debug(f"Cache hit for: {text[:50]}...")
            return self.audio_cache[cache_key]

        # Check file cache
        cache_path = Path(config.cache_dir) / f"{cache_key}.wav"
        if cache_path.exists():
            logger.debug(f"File cache hit for: {text[:50]}...")
            with open(cache_path, "rb") as f:
                audio_data = f.read()
            self.audio_cache[cache_key] = audio_data
            return audio_data

        # Generate speech
        logger.info(f"Synthesizing: {text[:50]}...")

        try:
            if self.voice_prompt is not None:
                # Use voice cloning
                audio_array, sample_rate = self.model.generate_voice_clone(
                    text=text,
                    voice_prompt=self.voice_prompt,
                    speed=rate
                )
            else:
                # Use default voice
                audio_array, sample_rate = self.model.generate(
                    text=text,
                    speed=rate
                )

            # Convert to WAV bytes
            audio_data = self._array_to_wav(audio_array, sample_rate)

            # Cache result
            self.audio_cache[cache_key] = audio_data
            with open(cache_path, "wb") as f:
                f.write(audio_data)

            return audio_data

        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            raise

    def _get_cache_key(self, text: str, rate: float) -> str:
        """Generate cache key for text + settings."""
        content = f"{text}|{rate}|{config.model_name}"
        return hashlib.md5(content.encode()).hexdigest()

    def _array_to_wav(self, audio_array, sample_rate: int) -> bytes:
        """Convert numpy array to WAV bytes."""
        import numpy as np

        # Normalize to int16
        audio_int16 = (audio_array * 32767).astype(np.int16)

        # Create WAV in memory
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)  # 16-bit
            wav.setframerate(sample_rate)
            wav.writeframes(audio_int16.tobytes())

        buffer.seek(0)
        return buffer.read()

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    @property
    def has_voice_clone(self) -> bool:
        return self.voice_prompt is not None


# Global TTS engine instance
tts_engine = TTSEngine()

# ============================================================================
# API ROUTES
# ============================================================================

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for the game to detect server availability."""
    return jsonify({
        "status": "ok",
        "initialized": tts_engine.is_initialized,
        "voice_clone_active": tts_engine.has_voice_clone if tts_engine.is_initialized else False,
        "model": config.model_name
    })


@app.route("/synthesize", methods=["POST"])
def synthesize():
    """
    Synthesize speech from text.

    Request JSON:
        - text: string (required) - Text to synthesize
        - rate: float (optional) - Speech rate (0.5-2.0, default 1.0)
        - voice_id: string (optional) - Voice identifier (for future use)

    Returns:
        Audio file (WAV format)
    """
    try:
        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' field"}), 400

        text = data["text"]
        rate = data.get("rate", 1.0)

        # Clamp rate to valid range
        rate = max(0.5, min(2.0, rate))

        # Synthesize
        audio_data = tts_engine.synthesize(text, rate)

        # Return as audio file
        return Response(
            audio_data,
            mimetype="audio/wav",
            headers={
                "Content-Disposition": "inline; filename=speech.wav",
                "Cache-Control": "public, max-age=3600"
            }
        )

    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/voices", methods=["GET"])
def list_voices():
    """List available voices."""
    voices = [
        {
            "id": "gm-narrator",
            "name": "Game Master (Lovecraft)",
            "lang": "en",
            "description": "Mysterious narrator voice for GM commentary"
        }
    ]

    if tts_engine.is_initialized and tts_engine.has_voice_clone:
        voices[0]["status"] = "active"
    else:
        voices[0]["status"] = "default"

    return jsonify(voices)


@app.route("/reference", methods=["POST"])
def upload_reference():
    """
    Upload a reference audio file for voice cloning.

    Form data:
        - audio: file (WAV format, ~3 seconds)
        - text: string - Transcript of the audio
    """
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    text = request.form.get("text", config.reference_text)

    # Save reference audio
    ref_dir = Path(config.reference_audio).parent
    ref_dir.mkdir(parents=True, exist_ok=True)

    ref_path = Path(config.reference_audio)
    audio_file.save(ref_path)

    # Update config
    config.reference_text = text

    # Reload voice prompt
    tts_engine._load_voice_prompt()

    return jsonify({
        "status": "ok",
        "message": "Reference audio updated",
        "voice_clone_active": tts_engine.has_voice_clone
    })


@app.route("/status", methods=["GET"])
def get_status():
    """Get detailed server status."""
    return jsonify({
        "status": "ok",
        "initialized": tts_engine.is_initialized,
        "voice_clone_active": tts_engine.has_voice_clone if tts_engine.is_initialized else False,
        "model": config.model_name,
        "device": config.device,
        "cache_dir": config.cache_dir,
        "reference_audio_exists": Path(config.reference_audio).exists()
    })


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point."""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║           Mythos Quest - Qwen3-TTS Voice Server                  ║
╠══════════════════════════════════════════════════════════════════╣
║  This server provides voice synthesis for Game Master narration  ║
║                                                                  ║
║  The TTS model will be downloaded on first use (~2-4 GB)         ║
║  Voice cloning requires a 3-second reference audio file          ║
╚══════════════════════════════════════════════════════════════════╝
""")

    logger.info(f"Starting server on http://{config.host}:{config.port}")
    logger.info(f"Model: {config.model_name}")
    logger.info(f"Reference audio: {config.reference_audio}")

    # Check if reference audio exists
    if Path(config.reference_audio).exists():
        logger.info("✓ Reference audio found - voice cloning will be enabled")
    else:
        logger.warning("✗ Reference audio not found - using default voice")
        logger.warning(f"  To enable voice cloning, add a 3-second WAV file to:")
        logger.warning(f"  {config.reference_audio}")

    print("\nServer ready! The game will connect automatically.")
    print("Press Ctrl+C to stop.\n")

    app.run(
        host=config.host,
        port=config.port,
        debug=False,
        threaded=True
    )


if __name__ == "__main__":
    main()
