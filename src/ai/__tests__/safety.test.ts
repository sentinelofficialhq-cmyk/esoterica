import { CRISIS_RESOURCES, detectCrisis } from '@/ai/safety';

test.each(['I want to kill myself', "I've been feeling suicidal", 'I just want to end it all', 'thinking about self-harm again', 'there is no reason to live'])(
  'flags: %s',
  (text) => expect(detectCrisis(text)).toBe(true),
);

test.each(['I dreamed of a killer whale', 'I want to end my shift early', 'the shadow wants to die down', 'my plant is dying'])(
  'does not flag: %s',
  (text) => expect(detectCrisis(text)).toBe(false),
);

test('resources include 988', () => {
  expect(CRISIS_RESOURCES.map((r) => r.url)).toContain('tel:988');
});
