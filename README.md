# DIH Routing

Static planning tools for the ten eligible DIH routing modules: ANUBIS, TEHUTI, DrumKrushGlue, MARIANA, MONOLITH, Drum Morpher, SacredVerb, LookOut, SILVER, and NTRPL.

The published interfaces share `routing-registry.js` and `routing-core.js`. The registry distinguishes KEY, DUCK, and external-sidechain capability, records verification status, and avoids turning unverified mappings into automatic control instructions.

Routing modes are intentionally distinct:

- **A:** detector-only key; the key path must not become unintended audible audio.
- **B:** conventional wet return; the wet return remains audible and is checked for dry/wet doubling.
- **C:** No Output collector plus a separate audible return; collector and return are never conflated.

NTRPL uses dedicated rewrite/alternate-output topology and requires an explicit parallel-dry duplicate where dry and processed audio are both desired. SacredVerb models internal reverb creation separately from its wet-layer duck. SILVER is reference matching, not a generic ducking processor; Drum Morpher is capture/instrument routing, not a generic ducking processor.

These pages are planning and static-topology tools. They do not modify Logic Pro, write plugin parameters, prove native control mappings, or validate audio. Verify the installed plugin build and the actual host signal path before using a plan in a session.

## One-condition bounce workflow

Use the companion Logic templates and the repeatable protocol in [TEST_PROTOCOL.md](TEST_PROTOCOL.md). Each bounce changes one condition only, so a result can be attributed to a module, its key/reference state, or its topology—not to several simultaneous edits. The current installed Routing Studio AU remains a separate deliverable and must be rebuilt/verified independently of this web repository.

## Test

```sh
node tests/routing-core.test.js
```
