const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluasiDialogJerman } = require('../src/core/dialogValidator.js');
const { cekKelayakanKeRWTH, tanganiInsidenBangkok } = require('../src/core/freeRoamRules.js');

test('WB-01 | evaluasiDialogJerman P1: input string kosong ditolak (INVALID_EMPTY)', () => {
  const res = evaluasiDialogJerman('   ', true);
  assert.equal(res.status, 'INVALID_EMPTY');
  assert.equal(res.lolos, false);
  assert.equal(res.skor, 0);
});

test('WB-02 | evaluasiDialogJerman P2: input lebih dari 80 karakter ditolak (INVALID_LENGTH)', () => {
  const longText = 'Guten Tag Frau Neuefeiend '.repeat(4);
  const res = evaluasiDialogJerman(longText, true);
  assert.equal(res.status, 'INVALID_LENGTH');
  assert.equal(res.lolos, false);
  assert.equal(res.skor, 0);
});

test('WB-03 | evaluasiDialogJerman P3: kata kunci cocok + sudah baca kamus (PASS_FLUENT)', () => {
  const res = evaluasiDialogJerman('Guten Tag, Frau Neuefeiend. Ich studiere an der RWTH.', true);
  assert.equal(res.status, 'PASS_FLUENT');
  assert.equal(res.lolos, true);
  assert.equal(res.skor, 100);
});

test('WB-04 | evaluasiDialogJerman P4: kata kunci cocok tanpa baca kamus (PASS_BASIC)', () => {
  const res = evaluasiDialogJerman('Guten Morgen!', false);
  assert.equal(res.status, 'PASS_BASIC');
  assert.equal(res.lolos, true);
  assert.equal(res.skor, 70);
});

test('WB-05 | evaluasiDialogJerman P5: kalimat tidak mengandung kosakata Jerman (FAIL_MISUNDERSTOOD)', () => {
  const res = evaluasiDialogJerman('Permisi Bu, saya mau pergi kuliah dulu ya', true);
  assert.equal(res.status, 'FAIL_MISUNDERSTOOD');
  assert.equal(res.lolos, false);
  assert.equal(res.skor, 25);
});

test('WB-06 | cekKelayakanKeRWTH P1: belum memeriksa objek kamar sama sekali (LOCKED_NO_EXPLORE)', () => {
  const res = cekKelayakanKeRWTH([], false);
  assert.equal(res.bolehBerangkat, false);
  assert.equal(res.kode, 'LOCKED_NO_EXPLORE');
});

test('WB-07 | cekKelayakanKeRWTH P2: hanya periksa meja belajar tanpa jendela kamar (LOCKED_INCOMPLETE_ROOM)', () => {
  const res = cekKelayakanKeRWTH(['german_dict'], false);
  assert.equal(res.bolehBerangkat, false);
  assert.equal(res.kode, 'LOCKED_INCOMPLETE_ROOM');
});

test('WB-08 | cekKelayakanKeRWTH P3: kamar sudah diperiksa tetapi belum uji bahasa Jerman (LOCKED_NEED_FRAU_DIALOG)', () => {
  const res = cekKelayakanKeRWTH(['german_dict', 'window'], false);
  assert.equal(res.bolehBerangkat, false);
  assert.equal(res.kode, 'LOCKED_NEED_FRAU_DIALOG');
});

test('WB-09 | cekKelayakanKeRWTH P4: seluruh syarat kamar dan dialog lulus (READY_RWTH)', () => {
  const res = cekKelayakanKeRWTH(['physics_books', 'german_dict', 'warsaw_lp', 'window'], true);
  assert.equal(res.bolehBerangkat, true);
  assert.equal(res.kode, 'READY_RWTH');
});

test('WB-10 | tanganiInsidenBangkok: teriakan panik Vuur dan humor penyelamat aktif', () => {
  const p1 = tanganiInsidenBangkok('panic_shout', 75);
  assert.equal(p1.status, 'PANIC_VUUR');
  assert.equal(p1.ketenanganAkhir, 60);
  assert.equal(p1.humorAktif, true);

  const p2 = tanganiInsidenBangkok('inspect_alert', 75);
  assert.equal(p2.status, 'CURIOUS_VUUR');
  assert.equal(p2.ketenanganAkhir, 70);

  const p3 = tanganiInsidenBangkok('unknown', 75);
  assert.equal(p3.status, 'INVALID_ACTION');
  assert.equal(p3.humorAktif, false);
});
