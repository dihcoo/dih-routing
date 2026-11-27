'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const registry = require('../routing-registry.js');
const core = require('../routing-core.js');

const moduleNames = registry.modules.map(module => module.name);
const configuratorHtml = fs.readFileSync(path.join(__dirname, '../dih_ducking_configurator.html'), 'utf8');
const routerHtml = fs.readFileSync(path.join(__dirname, '../dih_ten_module_router.html'), 'utf8');

function loadRouterInterface() {
  const script = [...routerHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .find(source => source.includes("const FORMAT='DIH-ten-module-routing-v5'"));
  assert.ok(script, 'ten-module router application script exists in the HTML');
  const sandbox = { module: { exports: {} }, require, DIHRoutingRegistry: registry, DIHRoutingCore: core };
  vm.runInNewContext(script, sandbox, { filename: 'dih_ten_module_router.html' });
  return sandbox.module.exports;
}

test('both HTML interfaces load the production registry and shared routing core', () => {
  for (const html of [configuratorHtml, routerHtml]) {
    assert.match(html, /<script src="routing-registry\.js"><\/script>/);
    assert.match(html, /<script src="routing-core\.js"><\/script>/);
  }
  assert.match(configuratorHtml, /DIHRoutingRegistry\.modules\.map/);
  assert.match(routerHtml, /const PLUGINS=DIHRoutingRegistry\.modules\.map/);
  assert.equal(moduleNames.length, 10);
});

test('configurator keeps manual processor values separate from AUTO recommendations', () => {
  assert.match(configuratorHtml, /AUTO:"AUTO — follow recommendation"/);
  assert.match(configuratorHtml, /selectedP1:\$\("p1"\)\.value/);
  assert.match(configuratorHtml, /DIHRoutingCore\.resolveModule\(raw\.selectedP1,recommendation\.primary\)/);
  assert.doesNotMatch(configuratorHtml, /\$\("goal"\)\.addEventListener\("change",\(\)=>\{\s*const r=recommend\(state\(\)\);\s*\$\("p1"\)\.value=r\.primary/);
  assert.match(configuratorHtml, /Explicitly selected: \$\{s\.p1\}\. This processor is retained/);
});

test('configurator keeps detector, reference, capture, and optional SacredVerb inputs distinct', () => {
  const helper = configuratorHtml.match(/function moduleInputKind\(name, goal\)\{[\s\S]*?\n\}/);
  assert.ok(helper, 'module-specific input classifier exists in the HTML');
  const sandbox = { DIHRoutingRegistry: registry };
  vm.runInNewContext(`${helper[0]}\nglobalThis.classifyInput = moduleInputKind;`, sandbox);
  assert.equal(sandbox.classifyInput('ANUBIS', 'duck'), 'detector');
  assert.equal(sandbox.classifyInput('LookOut', 'duck'), 'detector');
  assert.equal(sandbox.classifyInput('DrumKrushGlue', 'layer'), 'detector');
  assert.equal(sandbox.classifyInput('SacredVerb', 'wet'), 'detector');
  assert.equal(sandbox.classifyInput('SacredVerb', 'spectral'), null);
  assert.equal(sandbox.classifyInput('SILVER', 'reference'), 'reference');
  assert.equal(sandbox.classifyInput('Drum Morpher', 'capture'), 'capture');
});

test('router workflow validation covers all 30 module/mode combinations', () => {
  const router = loadRouterInterface();
  let combinations = 0;
  for (const moduleRecord of registry.modules) {
    for (const mode of ['A', 'B', 'C']) {
      const config = router.defaultConfig();
      config.plugins.forEach(plugin => { plugin.enabled = plugin.name === moduleRecord.name; });
      config.workflow = mode === 'A' ? 'standard' : mode === 'B' ? 'wet' : 'altcollector';
      config.alt.processor = moduleRecord.name;
      const errors = router.validate(config).errors.join('\n');
      assert.equal(/not registry-supported for routing mode/.test(errors), !moduleRecord.modes.includes(mode), `${moduleRecord.name} / ${mode}`);
      assert.equal(config.plugins.find(plugin => plugin.name === moduleRecord.name).enabled, true);
      assert.equal(config.alt.processor, moduleRecord.name);
      combinations++;
    }
  }
  assert.equal(combinations, 30);
});

test('router retains explicit SacredVerb selection and surfaces incompatible mode', () => {
  const router = loadRouterInterface();
  const config = router.defaultConfig();
  const sacredVerb = config.plugins.find(plugin => plugin.name === 'SacredVerb');
  sacredVerb.enabled = true;
  config.workflow = 'standard';
  const result = router.validate(config);
  assert.equal(sacredVerb.enabled, true);
  assert.match(result.errors.join('\n'), /SacredVerb is not registry-supported for routing mode A/);
});

test('Mode C diagram, plans, and save/restore preserve its selected module and collector topology', () => {
  const router = loadRouterInterface();
  const config = router.defaultConfig();
  config.workflow = 'altcollector';
  config.alt.processor = 'SacredVerb';
  config.plugins.find(plugin => plugin.name === 'SacredVerb').enabled = true;
  const diagram = router.diagram(config);
  const instructions = router.stepsForConfig(config);
  const exported = router.exportText(config);
  assert.match(diagram, /EFFECT INSERT → SacredVerb/);
  assert.match(diagram, /NO OUTPUT/);
  assert.match(instructions[0].title, /SacredVerb/);
  assert.match(instructions[0].steps.join('\n'), /only the wet layer/);
  assert.match(exported, /Enabled modules: ANUBIS, TEHUTI, SacredVerb/);
  assert.match(exported, /Mode C collector processor: SacredVerb/);
  const restored = router.normalizeImport(config);
  assert.equal(restored.alt.processor, 'SacredVerb');
  assert.equal(restored.plugins.find(plugin => plugin.name === 'SacredVerb').enabled, true);
});

test('workflow changes do not invoke a module-replacing preset automatically', () => {
  assert.match(routerHtml, /\$\('workflow'\)\.addEventListener\('change',\(\)=>\{const c=getConfig\(\);c\.workflow=\$\('workflow'\)\.value;setConfig\(c\);render\(\)\}\)/);
  assert.doesNotMatch(routerHtml, /\$\('workflow'\)\.addEventListener\('change',\(\)=>\{const c=getConfig\(\);applyWorkflow/);
});
