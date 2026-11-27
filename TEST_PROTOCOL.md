# DIH isolated routing test protocol

This protocol records host evidence; it is not an automatic plugin-control map. Use one module and one changed condition per bounce. Preserve the `Routing Tests` archive as the permanent result store.

## Logic templates

All current templates have the same clean four-track rig:

1. `PROGRAM — one module under test`
2. `KEY — external trigger only`
3. `REFERENCE / ALT INPUT — optional`
4. `BOUNCE LOG — one condition per pass`

The new templates are in Logic Pro's Project Templates folder:

- `DIH 09 - Isolated Routing Test Rig`
- `DIH 10 - Dynamics Detector Tests` — ANUBIS, TEHUTI, LookOut
- `DIH 11 - Generator Layer Tests` — DrumKrushGlue, MARIANA, MONOLITH
- `DIH 12 - Wet Return and Collector Tests` — SacredVerb and external wet-return ducking
- `DIH 13 - NTRPL and SILVER Tests` — rewrite and reference paths

Use the existing `DIH HUB - MPC and Drum Morpher` template for Drum Morpher. It is intentionally separate: capture uses the source routed to Drum Morpher Side Chain with `LIVE MPC AUDIO` enabled, while its MIDI pad path remains independent.

## Common bounce sequence

Before every test, record the plugin/build, Logic version, sample rate, buffer, module preset/state, source file, buses/sends, output destination, and whether the result was offline or realtime.

1. Bounce processor bypassed / baseline.
2. Bounce active with no key/reference stimulus. For a no-key check, remove the send or bypass the source path; do not rely only on a Side Chain `None` selector.
3. Bounce active with key/reference stimulus.
4. Bounce the key/reference gap or silence segment.
5. Save, reopen, then repeat the active condition.
6. Compare playback and offline bounce. Check mono and stereo separately when applicable.

Name each file `YYYYMMDD_module_mode_condition_build.wav`; add one measured outcome to the corresponding Routing Tests log.

## Group-specific guardrails

### Dynamics detectors

- ANUBIS: test KEY and DUCK separately, then together; do not assume one enables the other.
- TEHUTI: test its own external-key response. `None`/self-key behavior is build-dependent until the installed build proves it.
- LookOut: test KEY only, DUCK only, then both.

### Generated layers

Test DrumKrushGlue, MARIANA, and MONOLITH against their own audible layer. The kick/key must not leak into the printed program. Treat an external sidechain as unverified unless the installed AU exposes and responds to it.

### Wet return and collector

Keep dry program, collector, and audible wet return separate. A Mode C collector is not an audible return. If ANUBIS is intended as the sole wet-return duck after SacredVerb, set SacredVerb Reverb Duck to `0` for that test and log it; otherwise reductions can stack.

### NTRPL and SILVER

- NTRPL 1.0.9: first make a layer-only, key-versus-no-key render with a known stimulus. Do not claim a detector/duck result from a near-unity full-mix bounce. For parallel topology, retain one intentional dry duplicate and ensure the source is not summed twice.
- SILVER: reference is analysis-only. It must not become audible program material; test reference match independently of detector-style ducking.

### Drum Morpher

Use the existing Hub/MPC template. Verify capture, monitoring, and silence independently from MIDI pad performance. Controller behavior should follow the documented Hub architecture; do not substitute generic sidechain or ducking tests.
