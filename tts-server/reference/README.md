# GM Voice Reference Audio

This folder should contain a 3-second WAV file for voice cloning.

## Requirements

- **Format:** WAV (PCM, 16-bit, mono or stereo)
- **Duration:** ~3 seconds
- **Content:** Clear speech with minimal background noise

## Recommended Reference Text

Speak this text in your desired GM voice:

> "The shadows grow long as ancient evil stirs in the darkness."

This text was chosen because it:
- Contains a variety of phonemes
- Has a Lovecraftian tone
- Sets the atmospheric expectation

## How to Create Reference Audio

### Option 1: Record Yourself

1. Use a quiet room
2. Speak slowly and clearly
3. Use a mysterious, ominous tone
4. Record at 44.1kHz or 48kHz
5. Save as `gm-voice.wav`

### Option 2: Use AI Voice Generator

1. Visit [ElevenLabs](https://elevenlabs.io/), [PlayHT](https://play.ht/), or similar
2. Find a voice with these characteristics:
   - Male, older
   - British or American accent
   - Low, resonant tone
   - Mysterious/narrator style
3. Generate the reference text
4. Download and save as `gm-voice.wav`

### Option 3: Use Stock Voice Samples

Search for:
- "Old radio narrator voice"
- "Audiobook narrator male"
- "Horror narrator voice"

Ensure you have the rights to use the sample.

## Example Voice Characteristics

For a Lovecraftian GM narrator, aim for:

- **Tone:** Deep, resonant, slightly ominous
- **Pace:** Deliberate, measured, with pauses
- **Style:** Think classic BBC radio drama or horror audiobook
- **Emotion:** Controlled dread, mysterious knowledge

## Testing

After adding `gm-voice.wav`:

1. Start the TTS server: `python server.py`
2. The server will log if voice cloning is active
3. Play the game and listen to the narration

## File Location

Place your reference audio here:
```
tts-server/
└── reference/
    └── gm-voice.wav  <-- Your file here
```
