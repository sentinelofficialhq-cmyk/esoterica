import { buildProfile } from '@/engines/profile';
import { buildReading, type ReadingContext } from '@/readings/fromParams';

const ctx: ReadingContext = {
  profile: buildProfile({ name: 'Sam', birthName: 'John Smith', birthDate: '1990-05-14' }),
  people: [{ id: 'p1', name: 'Ana', birthDate: '1995-07-20', relation: 'friend' }],
  customEntities: [],
  quizzes: { types: null, archetypes: null, alignment: null },
  today: '2026-10-13',
  letterSystem: 'pythagorean',
};

test('date reading from params', () => {
  expect(buildReading({ type: 'date', date: '1976-04-01', label: 'Apple' }, ctx)?.facts.lifePath).toBe('28/1');
});

test('compatibility with an entity and with a person', () => {
  expect(buildReading({ type: 'compatibility', b: 'entity:apple' }, ctx)?.title).toBe('Sam & Apple');
  expect(buildReading({ type: 'compatibility', a: 'me', b: 'person:p1' }, ctx)?.facts.overall).toBe(61);
});

test('name comparison', () => {
  const doc = buildReading({ type: 'name', names: 'John Smith|Jon Smith' }, ctx);
  expect(doc?.sections.length).toBe(3);
});

test('defaults and failures', () => {
  expect(buildReading({ type: 'daily' }, ctx)?.facts.date).toBe('2026-10-13');
  expect(buildReading({ type: 'full' }, ctx)?.type).toBe('full');
  expect(buildReading({ type: 'compatibility', b: 'entity:nope' }, ctx)).toBeNull();
  expect(buildReading({ type: 'mystery' }, ctx)).toBeNull();
  expect(buildReading({ type: 'date', date: 'garbage' }, ctx)).toBeNull();
});
