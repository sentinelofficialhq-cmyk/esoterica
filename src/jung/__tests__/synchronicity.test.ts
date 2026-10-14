import { frequentNumbers, numberMeaning, numbersIn } from '@/jung/synchronicity';

test('repeating blocks reduce to their core', () => {
  expect(numberMeaning('11:11')).toMatchObject({ core: 11, reduced: { display: '11' } });
  expect(numberMeaning('1212').reduced.display).toBe('12/3');
  expect(numberMeaning('333')).toMatchObject({ core: 3, reduced: { value: 3 } });
  expect(numberMeaning('2222').core).toBe(22);
  expect(numberMeaning('44').core).toBe(4);
});

test('non-repeating numbers use their digit sum', () => {
  expect(numberMeaning('527')).toMatchObject({ core: 14, reduced: { display: '14/5', karmicDebt: 14 } });
});

test('extract numbers from free text', () => {
  expect(numbersIn('saw 11:11 and later 444 on a license plate').map((n) => n.raw)).toEqual(['11:11', '444']);
  expect(numbersIn('no numbers here')).toEqual([]);
});

test('frequency across log entries', () => {
  expect(frequentNumbers([['11:11', '444'], ['11:11'], ['22']])).toEqual([
    ['11:11', 2],
    ['22', 1],
    ['444', 1],
  ]);
});
