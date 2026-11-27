/* DIH Routing canonical module registry (schema v1).
 *
 * This is planning metadata, not a plugin-control protocol. `verified: false`
 * means the UI must not turn the field into an automatic control instruction.
 */
(function (root) {
  'use strict';

  const modules = [
    { id: 'anubis', name: 'ANUBIS', function: 'Broadband ducking and external gate', goals: ['broadband-duck', 'external-gate', 'wet-return-duck'], key: 'independent-detector', duck: 'broadband', externalSidechain: true, modes: ['A', 'B', 'C'], role: 'full', defaultTarget: 'music', defaultSource: 'vocal', verification: 'source-and-host', caution: 'KEY and DUCK are independent; validate the installed build before quoting control values.' },
    { id: 'tehuti', name: 'TEHUTI', function: 'Spectral/key-responsive processing', goals: ['spectral-duck'], key: 'detector', duck: 'spectral', externalSidechain: true, modes: ['A', 'B'], role: 'band', defaultTarget: 'music', defaultSource: 'vocal', verification: 'source-and-host', caution: 'Do not inherit ANUBIS control behavior or detector law.' },
    { id: 'drumkrushglue', name: 'DrumKrushGlue', function: 'Drum pocket and generated glue layer', goals: ['drum-layer'], key: 'build-specific', duck: 'generated-layer', externalSidechain: 'unknown', modes: ['A', 'B'], role: 'layer', defaultTarget: 'drums', defaultSource: 'kick', verification: 'needs-current-build-audit', caution: 'Do not treat normal drum processing as an externally keyed duck by default.' },
    { id: 'mariana', name: 'MARIANA', function: 'Bass foundation and generated pressure layer', goals: ['bass-layer'], key: 'build-specific', duck: 'generated-layer', externalSidechain: 'unknown', modes: ['A', 'B'], role: 'layer', defaultTarget: 'bass', defaultSource: 'kick', verification: 'needs-current-build-audit', caution: 'A Side Chain None state must not self-key; verify the installed build.' },
    { id: 'monolith', name: 'MONOLITH', function: 'Impact and generated weight layer', goals: ['impact-layer'], key: 'build-specific', duck: 'generated-layer', externalSidechain: 'unknown', modes: ['A', 'B'], role: 'layer', defaultTarget: 'impact', defaultSource: 'kick', verification: 'needs-current-build-audit', caution: 'Keep audible impact and detector paths distinct.' },
    { id: 'drum-morpher', name: 'Drum Morpher', function: 'Instrument and external-audio capture/morph', goals: ['capture', 'instrument-routing'], key: 'not-a-duck-control', duck: 'not-applicable', externalSidechain: 'unknown', modes: ['C'], role: 'capture', defaultTarget: 'capture', defaultSource: 'music', verification: 'needs-host-audit', caution: 'Do not present MPC or capture routing as a generic sidechain-duck setup.' },
    { id: 'sacredverb', name: 'SacredVerb', function: 'Internal reverb generation and independently ducked wet layer', goals: ['reverb-tail-management', 'wet-return-duck'], key: 'wet-layer-sidechain', duck: 'wet-layer', externalSidechain: true, modes: ['B', 'C'], role: 'reverbduck', defaultTarget: 'reverb', defaultSource: 'vocal', verification: 'source-and-host', caution: 'The wet layer is distinct from the dry program; an external key is optional for ordinary reverb use.' },
    { id: 'lookout', name: 'LookOut', function: 'Transient shaping with independent Key and Duck paths', goals: ['broadband-duck', 'transient-control'], key: 'independent-detector', duck: 'broadband', externalSidechain: true, modes: ['A', 'B'], role: 'keyduck', defaultTarget: 'drums', defaultSource: 'kick', verification: 'source-and-host', caution: 'Do not require KEY ON merely to permit DUCK.' },
    { id: 'silver', name: 'SILVER', function: 'Reference-based level matching', goals: ['reference-matching'], key: 'reference-input', duck: 'not-applicable', externalSidechain: 'reference-only', modes: ['A'], role: 'reference', defaultTarget: 'master', defaultSource: 'reference', verification: 'needs-current-build-audit', caution: 'The reference is analysis-only, not a detector or audible mix path.' },
    { id: 'ntrpl', name: 'NTRPL', function: 'Rewrite and alternate-output processing', goals: ['rewrite', 'alternate-processing'], key: 'detector', duck: 'rewrite-layer', externalSidechain: true, modes: ['A', 'B', 'C'], role: 'rewrite', defaultTarget: 'music', defaultSource: 'vocal', verification: 'source-and-host', caution: 'Use the dedicated No Output source-bus topology only when the host route is verified; preserve an intentional dry duplicate for parallel work.' }
  ];

  const byName = Object.freeze(Object.fromEntries(modules.map(module => [module.name, Object.freeze(module)])));
  const registry = Object.freeze({ schemaVersion: 1, modules: Object.freeze(Object.values(byName)) });

  function assertRegistry() {
    if (registry.modules.length !== 10) throw new Error('DIH routing registry must contain exactly ten modules.');
    if (new Set(registry.modules.map(module => module.id)).size !== 10) throw new Error('DIH routing registry contains duplicate IDs.');
    registry.modules.forEach(module => {
      if (!module.name || !module.function || !module.goals.length || !module.modes.length) throw new Error(`Invalid registry entry: ${module.id}`);
    });
    return true;
  }

  const api = Object.freeze({ registry, modules: registry.modules, byName, assertRegistry });
  assertRegistry();
  root.DIHRoutingRegistry = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
