/* Shared deterministic planner guards. No host, plugin, Hub, or DSP writes. */
(function (root) {
  'use strict';
  const registry = root.DIHRoutingRegistry;
  if (!registry) throw new Error('routing-core.js requires routing-registry.js');

  const goalLabels = Object.freeze({
    'broadband-duck': 'Broadband attenuation', 'external-gate': 'Key-triggered gate', 'spectral-duck': 'Spectral attenuation',
    'reverb-tail-management': 'Reverb-tail management', 'reference-matching': 'Reference matching',
    'capture': 'Capture / instrument routing', 'rewrite': 'Rewrite / alternate processing', 'transient-control': 'Transient control',
    'drum-layer': 'Drum layer', 'bass-layer': 'Bass layer', 'impact-layer': 'Impact layer', 'instrument-routing': 'Instrument routing', 'wet-return-duck': 'Wet-return duck'
  });

  function recommend(goal, mode) {
    const matches = registry.modules.filter(module => module.goals.includes(goal) && (!mode || module.modes.includes(mode)));
    return matches.map(module => ({ module, explanation: `${module.name}: ${module.function}.` }));
  }

  function resolveModule(selectedModule, recommendedModule) {
    const name = selectedModule == null || selectedModule === 'AUTO' ? recommendedModule : selectedModule;
    if (!registry.modules.some(module => module.name === name)) throw new Error(`Unknown routing module: ${String(name)}`);
    return name;
  }

  function resolveSelection({ selectedModule, recommendedModule, mode } = {}) {
    const name = resolveModule(selectedModule, recommendedModule);
    const moduleRecord = registry.modules.find(module => module.name === name);
    const valid = moduleRecord.modes.includes(mode);
    return Object.freeze({
      module: name,
      moduleRecord,
      mode,
      valid,
      errors: valid ? [] : [`${name} is not registry-supported for routing mode ${String(mode)}. Selection retained. Supported modes: ${moduleRecord.modes.join(', ')}.`]
    });
  }

  function validateTopology(topology) {
    const errors = [], warnings = [];
    const mode = topology && topology.mode;
    if (!['A', 'B', 'C'].includes(mode)) errors.push('Choose routing mode A, B, or C.');
    if (topology && topology.keyBus && topology.keyBus === topology.audibleReturn) errors.push('An audible return must not feed its own key.');
    if (mode === 'B' && (!topology || !topology.audibleReturn)) errors.push('Mode B requires a separate audible wet return.');
    if (mode === 'C') {
      if (!topology || !topology.collector) errors.push('Mode C requires a collector.');
      if (!topology || !topology.audibleReturn) errors.push('Mode C requires a separate audible return.');
      if (topology && topology.collector === topology.audibleReturn) errors.push('Mode C collector and audible return must be separate.');
      if (topology && topology.collectorAudible) errors.push('Mode C collector must not be an unintended audible path.');
    }
    if (topology && topology.module) {
      const moduleRecord = registry.modules.find(module => module.name === topology.module);
      if (!moduleRecord) errors.push(`Unknown routing module: ${String(topology.module)}`);
      else if (['A', 'B', 'C'].includes(mode) && !moduleRecord.modes.includes(mode)) {
        errors.push(`${moduleRecord.name} is not registry-supported for routing mode ${mode}. Selected module is retained; supported modes: ${moduleRecord.modes.join(', ')}.`);
      }
    }
    if (topology && topology.module === 'NTRPL') {
      warnings.push('NTRPL requires a layer-only/key-versus-no-key bounce on the installed build before its detector or duck behavior is treated as proven.');
      if (topology.parallelDry && !topology.separateDryDuplicate) warnings.push('NTRPL parallel dry requires an explicit separate dry duplicate; do not double-sum the source.');
    }
    if (topology && topology.module === 'SacredVerb' && topology.outerDuck && !topology.nativeWetDuckDisabled) warnings.push('When an external processor is intended to be the only wet-return duck, set SacredVerb Reverb Duck to 0 and document the result; otherwise the two reductions can stack.');
    return { errors, warnings, valid: errors.length === 0 };
  }

  const api = Object.freeze({ goalLabels, recommend, resolveModule, resolveSelection, validateTopology });
  root.DIHRoutingCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
