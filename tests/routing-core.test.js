'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../routing-registry.js');
const core = require('../routing-core.js');

const expectedModules = ['ANUBIS', 'TEHUTI', 'DrumKrushGlue', 'MARIANA', 'MONOLITH', 'Drum Morpher', 'SacredVerb', 'LookOut', 'SILVER', 'NTRPL'];

test('registry contains the canonical ten modules', () => {
  assert.equal(registry.assertRegistry(), true);
  assert.deepEqual(registry.modules.map(module => module.name), expectedModules);
});

test('explicit selection wins over recommendations and AUTO alone follows them', () => {
  for (const name of expectedModules) {
    assert.equal(core.resolveModule(name, 'ANUBIS'), name);
  }
  assert.equal(core.resolveModule('SacredVerb', 'TEHUTI'), 'SacredVerb');
  assert.equal(core.resolveModule('AUTO', 'TEHUTI'), 'TEHUTI');
  assert.throws(() => core.resolveModule('INVALID', 'ANUBIS'), /Unknown routing module/);
  assert.throws(() => core.resolveModule('toString', 'ANUBIS'), /Unknown routing module/);
});

test('planner-listed topology candidates retain the explicit module', () => {
  let candidates = 0;
  for (const moduleRecord of registry.modules) {
    for (const mode of moduleRecord.modes) {
      const selection = core.resolveSelection({
        selectedModule: moduleRecord.name,
        recommendedModule: 'ANUBIS',
        mode
      });
      assert.equal(selection.module, moduleRecord.name);
      assert.equal(selection.valid, true);
      candidates++;
    }
  }
  assert.ok(candidates > 0);
});

test('unlisted or separate workflows are not presented as impossible plugin behavior', () => {
  const possibleButUnlisted = core.resolveSelection({
    selectedModule: 'SacredVerb',
    recommendedModule: 'ANUBIS',
    mode: 'A'
  });
  assert.equal(possibleButUnlisted.module, 'SacredVerb');
  assert.equal(possibleButUnlisted.valid, false);
  assert.match(possibleButUnlisted.errors.join(' '), /compatibility is unverified, not necessarily impossible/);

  for (const name of ['Drum Morpher', 'SILVER']) {
    const separate = core.resolveSelection({ selectedModule: name, recommendedModule: 'ANUBIS', mode: 'A' });
    assert.equal(separate.module, name);
    assert.equal(separate.valid, false);
    assert.match(separate.errors.join(' '), /separate workflow/);
  }
});

test('AUTO recommendation is independent and mode-aware', () => {
  assert.equal(core.resolveSelection({
    selectedModule: 'AUTO',
    recommendedModule: 'TEHUTI',
    mode: 'A'
  }).module, 'TEHUTI');
  assert.equal(core.recommend('reference-matching').map(result => result.module.name).join(), 'SILVER');
  assert.equal(core.recommend('capture').map(result => result.module.name).join(), 'Drum Morpher');
  assert.equal(core.recommend('capture', 'C').length, 0);
  assert.equal(core.recommend('reference-matching', 'A').length, 0);
});

test('topology validation surfaces unlisted pairings without substitution', () => {
  const invalid = core.validateTopology({ module: 'SacredVerb', mode: 'A' });
  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join(' '), /compatibility is unverified, not necessarily impossible/);
  assert.match(invalid.errors.join(' '), /Selected module is retained/);
  assert.equal(core.validateTopology({ module: 'SacredVerb', mode: 'B', audibleReturn: 'Bus 4' }).valid, true);
  assert.match(core.validateTopology({ module: 'Unknown', mode: 'A' }).errors.join(' '), /Unknown routing module/);
});

test('Mode B and C enforce audible wet-return topology', () => {
  assert.match(core.validateTopology({ mode: 'B' }).errors.join('\n'), /audible wet return/);
  assert.match(core.validateTopology({ mode: 'C', collector: '38', audibleReturn: '38' }).errors.join('\n'), /must be separate/);
  assert.match(core.validateTopology({ mode: 'C', collector: '38', audibleReturn: '39', collectorAudible: true }).errors.join('\n'), /must not be an unintended audible path/);
  assert.equal(core.validateTopology({ mode: 'C', collector: '38', audibleReturn: '39', collectorAudible: false }).valid, true);
});

test('NTRPL and SacredVerb preserve module-specific warnings', () => {
  assert.match(core.validateTopology({ mode: 'A', module: 'NTRPL', parallelDry: true, separateDryDuplicate: false }).warnings.join('\n'), /separate dry duplicate/);
  assert.match(core.validateTopology({ mode: 'A', module: 'NTRPL' }).warnings.join('\n'), /layer-only\/key-versus-no-key bounce/);
  assert.match(core.validateTopology({ mode: 'C', module: 'SacredVerb', collector: '38', audibleReturn: '39', outerDuck: true }).warnings.join('\n'), /Reverb Duck to 0/);
});

test('KEY, DUCK, sidechain and verification metadata stay distinct', () => {
  const anubis = registry.byName.ANUBIS;
  const tehuti = registry.byName.TEHUTI;
  const silver = registry.byName.SILVER;
  const morpher = registry.byName['Drum Morpher'];
  assert.deepEqual([anubis.key, anubis.duck, anubis.externalSidechain], ['independent-detector', 'broadband', true]);
  assert.deepEqual([tehuti.key, tehuti.duck, tehuti.externalSidechain], ['detector', 'spectral', true]);
  assert.equal(silver.externalSidechain, 'reference-only');
  assert.equal(morpher.key, 'not-a-duck-control');
  assert.equal(morpher.duck, 'not-applicable');
  assert.equal(registry.byName.NTRPL.verification, 'needs-current-build-audit');
});
