# Database City: spy action soundtrack

Seven original synthesized WAV assets composed for this project without external samples. Instruments are procedural synth voices.

- city-theme: 30-second loop at 128 BPM with a heavy syncopated bass riff, electronic drums, staccato strings and brass-like spy motifs
- mission-theme: 26.67-second chase variation at 144 BPM, stronger drums, extra bass hits and denser melody
- click: short interface blip
- correct: ascending brass-like cue
- incorrect: low descending bass cue
- mission: drum fill and spy chord
- victory: action brass-like fanfare

Regenerate with `node scripts/generate-game-audio.cjs`. Rendered audio retains peak headroom without hard clipping. Playback begins after interaction and uses existing separate music/effect volume and mute settings. Background music pauses while hidden. Versioned URLs refresh cached audio.
