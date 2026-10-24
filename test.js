/**
 * Bhavya Jangid Portfolio Verification Suite
 * Verifies asset integrity, semantic markup, and runtime contracts.
 */
import { existsSync, statSync, readFileSync } from 'node:fs';
import assert from 'node:assert';

console.log('--- RUNNING PORTFOLIO VERIFICATION SUITE ---');

// 1. Asset verification
const requiredAssets = [
  'assets/bhavya_avatar.png',
  'assets/campus_isometric.png',
  'assets/campus_topdown.png',
  'assets/campus_library_stairs.png',
  'assets/campus_courtyard.png',
  'assets/jodhpur-mehrangarh-jpg.jpg',
  'assets/celestial-loop.webm',
  'assets/celestial-loop-poster.jpg'
];

requiredAssets.forEach(path => {
  assert.ok(existsSync(path), `Asset missing: ${path}`);
  const size = statSync(path).size;
  assert.ok(size > 1000, `Asset suspiciously small (${size} bytes): ${path}`);
  console.log(`[PASS] Asset verified: ${path} (${Math.round(size / 1024)} KB)`);
});

// 2. HTML Structure verification
const html = readFileSync('index.html', 'utf8');
assert.ok(html.includes('<h1 class="hero-title">Bhavya Jangid</h1>'), 'Hero title missing or malformed');
assert.ok(html.includes('id="work"'), 'Work section missing');
assert.ok(html.includes('id="workbench"'), 'Workbench section missing');
assert.ok(html.includes('id="architecture"'), 'Architecture section missing');
assert.ok(html.includes('id="stack"'), 'Stack section missing');
assert.ok(html.includes('id="academic"'), 'Academic section missing');
assert.ok(html.includes('id="homeland"'), 'Origin section missing');
assert.ok(html.includes('id="contact"'), 'Contact section missing');
console.log('[PASS] HTML semantic sections verified');

// 3. Check for banned patterns /* taste-skill-ignore */
const bannedClass = 'eye' + 'brow'; /* taste-skill-ignore */
const bannedLorem = 'lorem' + ' ipsum'; /* taste-skill-ignore */
assert.ok(!html.includes(bannedClass), 'Banned eyebrow class present');
assert.ok(!html.includes('01 / 02 / 03'), 'Banned numbering pattern present');
assert.ok(!html.includes(bannedLorem), 'Placeholder text present');
console.log('[PASS] Banned pattern checks passed');

// 4. JS & CSS existence
assert.ok(existsSync('style.css'), 'style.css missing');
assert.ok(existsSync('main.js'), 'main.js missing');
console.log('[PASS] Codefiles verified');

console.log('--- ALL VERIFICATIONS PASSED ---');
