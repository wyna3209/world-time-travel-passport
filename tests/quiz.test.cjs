const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'clock_practice.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/render\(\);\s*$/, '');

function session() {
  const elements = new Map();
  const node = () => ({ hidden: true, dataset: {}, append() {}, addEventListener() {}, focus() {} });
  const get = id => {
    if (!elements.has(id)) elements.set(id, node());
    return elements.get(id);
  };
  get('results').hidden = true;
  const timers = [];
  const destinations = [];
  const context = vm.createContext({
    document: { getElementById: get, createElement: node, addEventListener() {} },
    Option: function () {},
    setTimeout(fn, delay) { timers.push({ fn, delay }); return timers.length; },
    clearTimeout() {},
    window: { location: { assign(url) { destinations.push(url); } } }
  });
  vm.runInContext(source, context);
  return { run: code => vm.runInContext(code, context), get, timers, destinations };
}

const signatures = new Set();
for (let iteration = 0; iteration < 200; iteration++) {
  const s = session();
  const questions = JSON.parse(s.run('JSON.stringify(questions)'));
  assert.equal(questions.length, 20);
  signatures.add(JSON.stringify(questions));
  for (const kind of ['read', 'draw', 'easy', 'across']) {
    const group = questions.filter(q => q.kind === kind);
    assert.equal(group.length, 5);
    assert.equal(new Set(group.map(q => JSON.stringify(q))).size, 5);
    for (const q of group) {
      if (q.time) {
        assert.ok(q.time >= 60 && q.time <= 775);
        assert.equal(q.time % 5, 0);
      } else {
        assert.ok(q.end > q.start && q.end < 720);
        assert.equal((q.end - q.start) % 5, 0);
        if (kind === 'easy') assert.ok(q.end % 60 >= q.start % 60);
        else assert.ok(q.end >= Math.ceil(q.start / 60) * 60);
      }
    }
  }
}
assert.equal(signatures.size, 200);

for (const score of [0, 14, 15, 20]) {
  const s = session();
  s.run(`for (let i=0;i<20;i++) {
    index=i;
    readAnswer=()=>expected(questions[index])+(i<${score}?0:5);
    check();
    if(i<19 && !$('results').hidden)throw Error('Finished before all 20 answers');
  }`);
  assert.equal(s.get('results').hidden, false);
  assert.equal(s.get('resultTravel').hidden, score < 15);
  assert.equal(s.get('questionList').disabled, true);
  assert.equal(s.timers.length, score >= 15 ? 1 : 0);
  if (score >= 15) {
    assert.equal(s.timers[0].delay, 2000);
    s.timers[0].fn();
    assert.equal(s.destinations[0], './world_time_travel%20(2).html');
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(s.destinations[0]))));
  }
}

const s = session();
s.run('index=0; readAnswer=()=>NaN; check();');
assert.equal(s.run('questionResults[0]'), null);
s.run('readAnswer=()=>expected(questions[0]); check();');
assert.equal(s.run('questionResults[0]'), true);
s.run('readAnswer=()=>expected(questions[0])+5; check();');
assert.equal(s.run('questionResults[0]'), false);
console.log('Passed: 200 randomized quizzes; 0/14/15/20 score gates; all-20 completion; invalid input; answer changes; travel destination.');
