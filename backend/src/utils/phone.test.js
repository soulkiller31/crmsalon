import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhoneNumber } from './phone.js';

test('normalizePhoneNumber strips formatting and country code noise', () => {
  assert.equal(normalizePhoneNumber('+91 98765 43210'), '9876543210');
  assert.equal(normalizePhoneNumber('98765-43210'), '9876543210');
  assert.equal(normalizePhoneNumber('(987) 654-3210'), '9876543210');
  assert.equal(normalizePhoneNumber('9876543210'), '9876543210');
});

test('normalizePhoneNumber keeps blank values blank', () => {
  assert.equal(normalizePhoneNumber(''), '');
  assert.equal(normalizePhoneNumber(null), '');
  assert.equal(normalizePhoneNumber(undefined), '');
});
