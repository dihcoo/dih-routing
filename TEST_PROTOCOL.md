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

Use the existing Hub/MPC template. Owner reports MPC-to-METAMORPH capture succeeded in Logic on 26 Nov 2026. Record the installed build and retain a bounce or screenshot when available. Still verify monitoring, silence, and no-dry-doubling independently from MIDI pad performance. Controller behavior should follow the documented Hub architecture; do not substitute generic sidechain or ducking tests.

## Existing functional evidence (archive reviewed 26 Nov 2026)

This is a status of evidence already present in the owner-maintained Routing Tests archive, not a fresh certification of every installed build. Offline AU-host results prove engine response only; they do not prove Logic routing or saved-project behavior.

| Module | Evidence on file | Routing-guide status / remaining proof |
|---|---|---|
| ANUBIS | Logic 12.2, installed 1.0.12: a Bus 32 vocal key produced 51–63% KEY while active and 0% in gaps; Side Chain None was idle after the guard. | Key reception is observed in Logic. Keep KEY and DUCK as distinct controls; capture matched key-only, duck-only, and combined active/gap bounces before publishing numeric behavior. |
| TEHUTI | Logic 12.2, 1.0.7: Bus 32 key changed the tested ducking preset by about 2.04 dB in active windows and about 0.06 dB in gaps versus no-key; mono, silence, and post-fix None controls passed. | Logic-tested for this build, preset, source, and routing. Do not generalize to other presets/builds or untested topologies. |
| DrumKrushGlue | Offline AU host with distinct kick key: about 0.4 dB reduction during kicks and 0.3 dB between; no-sidechain control was unchanged. | Engine response observed but small. A matched Logic key/no-key bounce is still needed to verify host mapping and generated-layer behavior. |
| MARIANA | Offline AU host: about 3.3 dB reduction during kicks and 2.8 dB between; no-sidechain control was unchanged. | Engine response observed. Logic confirmed post-guard None is idle, but a post-guard real-key bounce is still needed. |
| MONOLITH | Offline AU host: about 3.7 dB reduction during kicks and 3.1 dB between; no-sidechain control was unchanged. | Engine response observed. Logic confirmed post-guard None is idle, but a post-guard real-key bounce is still needed. |
| Drum Morpher | AU sidechain input and Logic's Side Chain selector were present. Owner reports MPC connected to Drum Morpher in Logic and METAMORPH capture succeeded on 26 Nov 2026; no bounce or screenshot is yet in the archive. | Capture is owner-confirmed in this Logic session, not yet artifact-backed. Verify monitoring, silence, no-dry-doubling, and bounce/recall. Do not describe this as ordinary ducking. |
| SacredVerb | Wet/no-duck and keyed renders exist. The bypass render is invalid as a dry baseline because dry vocal is doubled; use `CHAIN_0`. | These files do not establish key-following in active versus gap windows. Re-test the wet-only layer with matched no-key and real-key passes; ordinary reverb must also work without a key. |
| LookOut | Offline AU host: about 10.6 dB reduction during kicks and 7.5 dB between; no-sidechain control changed about 0.3 dB. Logic's post-guard None state was idle. | Engine response observed. Logic key-only, duck-only, and combined passes are still needed to prove the host route and independent controls. |
| SILVER | Verified reference-on renders D/E exist; the earlier C render is invalid because the UI toggle did not change state. | Reference matching is not a detector sidechain. Compare valid reference-on renders with a matched reference-off baseline before claiming matching behavior. |
| NTRPL | Offline AU host showed about 1.4 dB reduction during kicks and a 0.5 dB increase between them; the no-sidechain control was unchanged. | Response is modest and not isolated to a layer in Logic. Keep detector behavior unverified until a layer-only, matched key/no-key Logic test passes. |

### NTRPL candidate Logic bounces (26 Nov; exploratory only)

Three archived 48 kHz stereo WAV pairs were compared by full-file RMS, waveform correlation, and 0.5-second RMS windows. The sidechain-on/off pairs changed full-file RMS by approximately 0.000 dB (`SETUP 1 BOTH TRACKS`), -0.003 dB (`BASS NO OUT`), and +0.001 dB (`TRACK 2 WITH BASS`). Correlations were 0.999836, 0.995827, and 0.999823 respectively. The `BASS NO OUT` pair varied by -0.704 to +0.839 dB across windows; the other two stayed within -0.141 to +0.046 dB.

The archive has no setup record tying these files to the NTRPL build, isolated output layer, or key-active/gap timing. These measurements therefore do not establish detector response; keep NTRPL unverified pending a documented, layer-only Logic test with matched key-on/key-off and active/gap renders.

### Archived 7-plugin pair re-analysis (27 Nov; exploratory only)

Re-measured the 20 Nov 48 kHz stereo WAVs with matched-duration RMS and waveform correlation. Key-on minus key-off full-file RMS was DrumKrushGlue -1.041 dB (correlation 0.9841), MARIANA -0.719 dB (0.9973), MONOLITH -0.714 dB (0.9974), and LookOut -1.790 dB (0.9375). In 0.25-second windows, the median delta was 0 dB for each pair, with negative changes concentrated in some windows.

These are measurable differences between archived files, not proof that the named processor caused them: the 7-plugin session does not provide an isolated output layer, and available records do not establish matched active/gap windows or exclude other chain state. Keep them exploratory; they do not close the Logic-host test requirement for those modules.

### Evidence gate for guide claims

Label behavior **Logic-verified** only when the installed build and host are recorded, the audible program and detector paths are separate, the no-key control removes the send (not just Side Chain `None`), and matched active/gap renders demonstrate the expected response. Save/reopen recall and no-key silence must also be checked. Keep offline-engine results labeled **offline-only**; do not use them alone to claim Logic routing works. The archive reviewed for this snapshot is not shipped with this repository, so retain its bounces, measurements, and screenshots alongside future test records.

The routing registry's `modes` arrays are planner candidates, not verified support or a complete applicability matrix. A pairing absent from the candidate list is unverified unless evidence makes it explicitly inapplicable. Drum Morpher capture and SILVER reference analysis are separate workflows, not A/B/C plugin modes. Do not count unlisted combinations as required plugin tests or invent mode-specific claims.
