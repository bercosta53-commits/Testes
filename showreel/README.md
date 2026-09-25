# Motion Showreel 2026

A 15-second, 1920×1080, 60 fps motion-graphics showreel: code-driven animation with a synthesized soundtrack that stays on the beat.

**Watch:** [`showreel.mp4`](showreel.mp4)

## The cut (128 BPM, 8 bars, 32 beats = 15.00 s)

| Bar | Beats | Scene | Craft on display |
|---|---|---|---|
| 1 | 0–4 | Ignition | A dot pops with an elastic ease, pulses on each beat, and a blueprint grid draws on. The dot then grows to fill the frame and becomes the next scene. |
| 2 | 4–8 | Kinetic type | Masked, staggered letter reveals, a stroke-to-fill wipe, echo outlines, and a split-frame transition. |
| 3 | 8–12 | Shape & easing | A polar-radius shape morphs with outBack overshoot, plus squash and stretch, time echoes, orbiters, and a live easing graph. |
| 4 | 12–16 | Particles | 2,600 particles scatter, assemble into CRAFT with a left-to-right sweep, then explode on the hit. |
| 5 | 16–20 | 3D & camera | 1,100 points, depth-sorted and in perspective, morph from sphere to torus to cube to helix while the camera dollies in. Ends on a glitch cut. |
| 6 | 20–24 | Systems & rhythm | Truchet tiles rotate in waves from shifting origins, then a circular wipe inverts the palette while the camera zooms and rotates. |
| 7 | 24–28 | Principles, then the reel in the reel | Four principles, one treatment each: TIMING bounces in, SPACING tracks out, WEIGHT falls with squash, RHYTHM runs as a marquee. Then earlier scenes play live in a 3×3 grid and collapse to the center. |
| 8 | 28–32 | Sign-off | An 8-spoke mark springs in and ticks on the beat, followed by the name and title. The iris closes back to the opening dot. |

The finishing pass runs on every frame: real motion blur (5 sub-frame samples across a 180° shutter), camera shake and chromatic aberration on hits, flash frames, vignette, and film grain.

## How it's made

- `reel.js` computes every frame from time alone, so frames can render in any order, on any number of workers, and come out identical every run. Opening `reel.html` in a browser (via a local server) plays a live preview.
- `audio.py` synthesizes the score with numpy and scipy: kicks, claps, hats, sidechained bass and pads, arpeggios, whooshes, impacts, and glitch stutters, all placed on the same beat grid as the visuals.
- `render.mjs` renders the frames in parallel in headless Chromium using Playwright, then encodes them to H.264 with AAC audio using ffmpeg.

```sh
pip install numpy scipy && python3 audio.py      # -> showreel.wav
npm i && FFMPEG=/path/to/ffmpeg node render.mjs  # -> showreel.mp4
```

Fonts (all under the SIL Open Font License): Unbounded, Space Grotesk, JetBrains Mono, Instrument Serif.
