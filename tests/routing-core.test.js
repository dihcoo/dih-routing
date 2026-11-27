'use strict';
const assert = require('node:assert/strict');
const registry = require('../routing-registry.js');
const core = require('../routing-core.js');

assert.equal(registry.assertRegistry(), true);
assert.equal(registry.modules.length, 10);
assert.deepEqual(registry.modules.map(module => module.name), ['ANUBIS', 'TEHUTI', 'DrumKrushGlue', 'MARIANA', 'MONOLITH', 'Drum Morpher', 'SacredVerb', 'LookOut', 'SILVER', 'NTRPL']);
assert.deepEqual(core.recommend('reference-matching', 'A').map(result => result.module.name), ['SILVER']);
assert.deepEqual(core.recommend('capture', 'C').map(result => result.module.name), ['Drum Morpher']);
assert.equal(core.recommend('reference-matching', 'B').length, 0);
assert.equal(core.validateTopology({ mode: 'A', keyBus: '32', audibleReturn: '36' }).valid, true);
assert.match(core.validateTopology({ mode: 'B' }).errors.join('\n'), /audible wet return/);
assert.match(core.validateTopology({ mode: 'C', collector: '38', audibleReturn: '38' }).errors.join('\n'), /must be separate/);
assert.match(core.validateTopology({ mode: 'C', collector: '38', audibleReturn: '39', collectorAudible: true }).errors.join('\n'), /must not be an unintended audible path/);
assert.match(core.validateTopology({ mode: 'A', module: 'NTRPL', parallelDry: true, separateDryDuplicate: false }).warnings.join('\n'), /separate dry duplicate/);
assert.match(core.validateTopology({ mode: 'A', module: 'NTRPL' }).warnings.join('\n'), /layer-only\/key-versus-no-key bounce/);
assert.match(core.validateTopology({ mode: 'C', module: 'SacredVerb', collector: '38', audibleReturn: '39', outerDuck: true }).warnings.join('\n'), /Reverb Duck to 0/);
console.log('routing-core tests passed');
