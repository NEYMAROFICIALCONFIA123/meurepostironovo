"""Render the project's original looping chiptune, using only Python's stdlib."""
import math
import struct
import wave
from pathlib import Path

RATE = 22050
STEP = 0.12
MELODY = [74,0,74,77,81,79,77,74,72,0,69,72,74,77,76,72,
          70,0,70,74,77,76,74,70,69,0,65,69,72,74,72,69,
          74,77,81,86,84,81,79,77,72,76,79,84,82,79,77,76,
          70,74,77,82,81,77,76,74,69,72,76,81,79,76,74,72]

def hz(note):
    return 440 * 2 ** ((note - 69) / 12)

output = Path(__file__).resolve().parents[1] / 'godot/assets/determination.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as f:
    f.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    data = bytearray()
    for i in range(round(RATE * STEP * 256)):
        time = i / RATE
        beat = int(time / STEP)
        local = time % STEP
        note = MELODY[beat % len(MELODY)]
        env = min(1, local / .004) * max(0, 1 - local / .115)
        lead = (1 if math.sin(math.tau * hz(note) * time) > 0 else -1) * .12 * env if note else 0
        bass_note = [38,36,34,33][(beat // 16) % 4]
        bass = math.asin(math.sin(math.tau * hz(bass_note) * time)) * .11
        kick_time = time % (STEP * 4)
        kick = math.sin(math.tau * (65 * kick_time + 1.8 * (1 - math.exp(-kick_time * 40)))) * math.exp(-kick_time * 35) * .2
        # Deterministic pseudo-noise percussion, no sampled or licensed audio.
        snare_time = (time + STEP * 2) % (STEP * 4)
        noise = math.sin(i * 78.233) * math.sin(i * 12.9898)
        snare = noise * math.exp(-snare_time * 65) * .12
        value = max(-1, min(1, lead + bass + kick + snare))
        data.extend(struct.pack('<h', int(value * 32767)))
    f.writeframes(data)
print(output)
