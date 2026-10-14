const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const scriptPath = 'hospital-research-ver2/budget.js';

test('cost calculator is available', () => {
  assert.ok(fs.existsSync(scriptPath), 'Version 2 budget calculator has not been implemented');
});

if (fs.existsSync(scriptPath)) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), context);
  const calculate = context.calculateBudget;
  const input = { medical: 900000, care: 100000, room: 0, extra: 200000, living: 100000, once: 150000 };
  test('daily care costs use actual days, monthly quotes use 30-day units, one-off cost occurs once', () => {
    assert.equal(calculate(input, 30).total, 4350000);
    assert.equal(calculate(input, 90).total, 12750000);
    assert.equal(calculate(input, 180).total, 25350000);
    assert.equal(calculate(input, 45).total, 6450000);
    assert.equal(calculate(input, 180).care, 18000000);
  });
  test('separate room costs and zero values work without subtracting uncertain refunds', () => {
    assert.equal(calculate({ medical: 1000000, room: 50000, care: 0, extra: 0, living: 0, once: 0 }, 30).total, 2500000);
    assert.equal(calculate({ medical: 0, room: 0, care: 0, extra: 0, living: 0, once: 0 }, 30).total, 0);
  });
  test('negative, missing and non-finite input cannot produce a misleading total', () => {
    for (const bad of [-1, NaN, Infinity, undefined, '']) {
      assert.throws(() => calculate({ ...input, medical: bad }, 30));
    }
    assert.throws(() => calculate(input, 0));
    assert.throws(() => calculate(input, 30.5));
  });
}
