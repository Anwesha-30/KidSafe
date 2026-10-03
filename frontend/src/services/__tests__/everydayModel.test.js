import test from 'node:test';
import assert from 'node:assert/strict';
import { initialEveryday, submitEveryday, reviewEveryday, everydayAvailable } from '../everydayModel.js';
const now = Date.UTC(2026, 9, 3, 12);
const purchase = { merchantId: 'shop@demo', merchantName: 'Snacks', item: 'Chocolate', category: 'Snacks / groceries', amount: 4000 };
const submit = (state, input = purchase, id = 'one', time = now) => submitEveryday(state, input, 'child', time, id);
test('unknown merchants wait; budget reserves pending amount without deducting balance', () => {
 const state = submit(initialEveryday());
 assert.equal(state.requests[0].status, 'pending'); assert.equal(state.balance, 100000); assert.equal(everydayAvailable(state, now), 16000); assert.match(state.requests[0].warnings[0], /First payment/);
});
test('parent approval pays exactly once; rejection never pays or remembers merchant', () => {
 const pending = submit(initialEveryday());
 const paid = reviewEveryday(pending, 'one', 'approve', true, 'parent', now);
 assert.equal(paid.balance, 96000); assert.equal(paid.requests[0].status, 'paid'); assert.equal(paid.approved['shop@demo'], 'Snacks');
 assert.throws(() => reviewEveryday(paid, 'one', 'approve', true, 'parent', now), /already/);
 const rejected = reviewEveryday(pending, 'one', 'reject', true, 'parent', now);
 assert.equal(rejected.balance, 100000); assert.equal(rejected.requests[0].status, 'rejected'); assert.deepEqual(rejected.approved, {});
});
test('one-time approval does not whitelist merchant', () => {
 const paid = reviewEveryday(submit(initialEveryday()), 'one', 'approve', false, 'parent', now);
 assert.equal(submit(paid, purchase, 'two').requests[0].status, 'pending');
});
test('remembered merchant pays directly but warning signals force review', () => {
 const known = { ...initialEveryday(), approved: { 'shop@demo': 'Snacks' } };
 assert.equal(submit(known).requests[0].status, 'paid');
 assert.equal(submit(known, { ...purchase, amount: 12000 }).requests[0].status, 'pending');
 assert.equal(submit(known, { ...purchase, category: 'Gift cards / digital codes' }).requests[0].status, 'pending');
});
test('invalid amounts, oversized requests, duplicate submissions and child approval fail', () => {
 for (const amount of [0, -1, NaN, Infinity, 1.5, 20001]) assert.throws(() => submit(initialEveryday(), { ...purchase, amount }));
 const pending = submit(initialEveryday());
 assert.throws(() => submit(pending), /already waiting/);
 assert.throws(() => reviewEveryday(pending, 'one', 'approve', true, 'child', now), /Only Parent/);
 assert.throws(() => submitEveryday(initialEveryday(), purchase, 'parent', now, 'x'), /Child view/);
});
test('approval checks current budget; pending funds stay reserved across daily reset', () => {
 const pending = submit(initialEveryday());
 assert.throws(() => reviewEveryday({ ...pending, balance: 2000 }, 'one', 'approve', false, 'parent', now), /no longer covers/);
 assert.equal(everydayAvailable(pending, now + 86400000), 16000);
 const paid = reviewEveryday(pending, 'one', 'approve', false, 'parent', now);
 assert.equal(everydayAvailable(paid, now), 16000); assert.equal(everydayAvailable(paid, now + 86400000), 20000);
});
test('merchant identity is normalized and repeats receive warning signals', () => {
 const known = { ...initialEveryday(), approved: { 'shop@demo': 'Snacks' } };
 const first = submit(known, { ...purchase, merchantId: ' SHOP@DEMO ' });
 const second = submit(first, purchase, 'two');
 const third = submit(second, purchase, 'three');
 assert.equal(third.requests[0].status, 'pending'); assert.ok(third.requests[0].warnings.some(w => w.includes('Multiple attempts')));
});
