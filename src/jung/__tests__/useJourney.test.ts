import type { ModeId } from '@/ai/modes';
import type { StoredMessage } from '@/ai/types';
import { SHADOW_PROMPTS } from '@/content/shadowPrompts';
import type { Dream, ShadowEntry } from '@/jung/types';
import { journeyStateFrom } from '@/jung/useJourney';
import type { SavedReading } from '@/readings/types';
import type { Conversation } from '@/store/chatStore';

const entry = (promptId: string): ShadowEntry => ({ id: promptId, date: '2026-10-13', promptId, text: 'x' });
const dream = (figures: string[]): Dream => ({
  id: 'd',
  date: '2026-10-13',
  title: '',
  text: 'a dream',
  mood: 3,
  tags: [],
  lucid: false,
  recurring: false,
  symbols: [],
  figures,
  themes: [],
});
const reading = (type: SavedReading['doc']['type']): SavedReading => ({
  id: type,
  createdAt: '2026-10-13T00:00:00Z',
  doc: { type, title: type, sections: [], facts: {} },
});
const conversation = (mode: ModeId, statuses: StoredMessage['status'][]): Conversation => ({
  id: mode,
  title: '',
  mode,
  provider: 'mock',
  model: 'mock',
  system: '',
  createdAt: '',
  updatedAt: '',
  extractedAt: 0,
  messages: statuses.map((status, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x', text: 'x', status })),
});
const base = { types: false, archetypes: false, alignment: false, shadowEntries: [], projections: [], dreams: [], synchronicities: [], readings: [], conversations: [] };

test('shadow entries carry the tags of the prompt they answered', () => {
  const persona = SHADOW_PROMPTS.find((p) => p.tags.includes('persona'))!;
  const s = journeyStateFrom({ ...base, shadowEntries: [entry(persona.id), entry('no-such-prompt')] });
  expect(s.shadowEntryTags).toEqual([persona.tags, []]);
});

test('active imagination counts sessions with a real exchange', () => {
  const s = journeyStateFrom({
    ...base,
    conversations: [
      conversation('activeImagination', ['ok', 'ok']),
      conversation('activeImagination', ['ok', 'stopped']),
      conversation('activeImagination', ['failed']),
      conversation('dreams', ['ok', 'ok']),
    ],
  });
  expect(s.activeImaginationSessions).toBe(1);
});

test('dream figures and saved reading types pass through', () => {
  const s = journeyStateFrom({ ...base, dreams: [dream(['shadow']), dream([])], readings: [reading('full'), reading('compatibility')] });
  expect(s.dreamFigures).toEqual([['shadow'], []]);
  expect(s.savedReadingTypes).toEqual(['full', 'compatibility']);
});
