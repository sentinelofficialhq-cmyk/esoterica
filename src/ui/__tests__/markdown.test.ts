import { parseBlocks } from '@/ui/Markdown';

test('splits headings, list items and paragraphs', () => {
  const md = '# Your reading\n\nThe first line\ncontinues here.\n\n- one\n- two\n\n## Shadow\nLast words.';
  expect(parseBlocks(md)).toEqual([
    { kind: 'h1', text: 'Your reading' },
    { kind: 'p', text: 'The first line continues here.' },
    { kind: 'li', text: 'one' },
    { kind: 'li', text: 'two' },
    { kind: 'h2', text: 'Shadow' },
    { kind: 'p', text: 'Last words.' },
  ]);
});

test('numbered lists count as list items', () => {
  expect(parseBlocks('1. first\n2. second')).toEqual([
    { kind: 'li', text: 'first' },
    { kind: 'li', text: 'second' },
  ]);
});
