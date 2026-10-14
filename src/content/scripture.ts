import type { PracticeId } from '@/content/neville';
import { reduce } from '@/engines/numerology';
import { hash } from '@/lib/hash';

export type ScriptureTheme =
  | 'beginnings'
  | 'partnership'
  | 'expression'
  | 'building'
  | 'change'
  | 'love'
  | 'inner'
  | 'abundance'
  | 'release'
  | 'vision'
  | 'manifestation'
  | 'compassion'
  | 'faith'
  | 'imagination'
  | 'stillness';

/**
 * A verse in the King James Version (public domain), quoted exactly; `excerpt` is the part usually quoted.
 * `reading` is Esoterica's own short note on how mystical readers, Neville Goddard among them, take it inwardly.
 * Mainstream Christian traditions often read these verses differently.
 */
export type Verse = { id: string; ref: string; text: string; excerpt?: string; reading: string; tags: ScriptureTheme[] };

export const SCRIPTURE: Verse[] = [
  {
    id: 'genesis-1-3',
    ref: 'Genesis 1:3',
    text: 'And God said, Let there be light: and there was light.',
    reading: 'Read inwardly, creation begins with a word spoken in consciousness: an inner “let there be” that comes before anything appears.',
    tags: ['beginnings', 'expression'],
  },
  {
    id: 'exodus-3-14',
    ref: 'Exodus 3:14',
    text: 'And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you.',
    excerpt: 'I AM THAT I AM',
    reading: 'Mystics read the divine name as pure awareness: the “I AM” you are before any label. Neville taught that whatever you join to “I am” with feeling, you begin to become.',
    tags: ['inner', 'beginnings', 'faith'],
  },
  {
    id: 'psalm-46-10',
    ref: 'Psalm 46:10',
    text: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
    excerpt: 'Be still, and know that I am God',
    reading: 'Stillness comes first. Contemplative traditions treat it as the ground of all inner work: quiet the noise, and know the presence that remains.',
    tags: ['stillness', 'inner', 'release'],
  },
  {
    id: 'psalm-82-6',
    ref: 'Psalm 82:6',
    text: 'I have said, Ye are gods; and all of you are children of the most High.',
    reading: 'A startling line, quoted again by Jesus in John 10:34. Esoteric readers take it as a reminder that people share in the creative power, and carry the responsibility that comes with it.',
    tags: ['manifestation', 'vision', 'imagination'],
  },
  {
    id: 'proverbs-4-23',
    ref: 'Proverbs 4:23',
    text: 'Keep thy heart with all diligence; for out of it are the issues of life.',
    reading: 'The heart here is the whole inner life. What you dwell on inwardly flows out into everything else, so tend it with care.',
    tags: ['inner', 'love'],
  },
  {
    id: 'proverbs-18-21',
    ref: 'Proverbs 18:21',
    text: 'Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof.',
    excerpt: 'Death and life are in the power of the tongue',
    reading: 'Words shape the inner world before the outer one. Neville applied this to the silent conversations we hold in our heads all day.',
    tags: ['expression'],
  },
  {
    id: 'proverbs-23-7',
    ref: 'Proverbs 23:7',
    text: 'For as he thinketh in his heart, so is he: Eat and drink, saith he to thee; but his heart is not with thee.',
    excerpt: 'For as he thinketh in his heart, so is he…',
    reading: 'Only the first half is usually quoted, and its point is simple and demanding: the self you inwardly assume is the self you live out.',
    tags: ['change', 'building', 'imagination'],
  },
  {
    id: 'habakkuk-2-2-3',
    ref: 'Habakkuk 2:2–3',
    text: 'And the LORD answered me, and said, Write the vision, and make it plain upon tables, that he may run that readeth it. For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it; because it will surely come, it will not tarry.',
    excerpt: 'Write the vision, and make it plain upon tables, that he may run that readeth it.',
    reading: 'A practical instruction inside a prophecy: make the vision clear enough to run with, then hold it patiently while it ripens.',
    tags: ['building', 'vision', 'manifestation'],
  },
  {
    id: 'matthew-6-6',
    ref: 'Matthew 6:6',
    text: 'But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret; and thy Father which seeth in secret shall reward thee openly.',
    reading: 'Mystics read the closet as the inner room of the mind: shut the door on the senses, and the work is done in secret before it shows openly.',
    tags: ['inner', 'stillness', 'imagination'],
  },
  {
    id: 'matthew-7-7',
    ref: 'Matthew 7:7',
    text: 'Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:',
    reading: 'Ask, seek, knock: three movements of desire, all of them active. Knowing clearly what you want comes first.',
    tags: ['beginnings', 'abundance'],
  },
  {
    id: 'matthew-9-29',
    ref: 'Matthew 9:29',
    text: 'Then touched he their eyes, saying, According to your faith be it unto you.',
    excerpt: 'According to your faith be it unto you.',
    reading: 'The healing follows the inner state of the ones who receive it. Neville read this as his law of assumption in a single sentence.',
    tags: ['faith', 'compassion', 'manifestation'],
  },
  {
    id: 'matthew-18-19',
    ref: 'Matthew 18:19',
    text: 'Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.',
    reading: 'Agreement between two is a creative force. Inwardly it can also be read as two parts of yourself coming into agreement: desire and belief.',
    tags: ['partnership', 'love'],
  },
  {
    id: 'mark-9-23',
    ref: 'Mark 9:23',
    text: 'Jesus said unto him, If thou canst believe, all things are possible to him that believeth.',
    reading: 'Possibility rests with the one who believes. The work is not forcing an outcome but loosening the disbelief that keeps it impossible inside you.',
    tags: ['faith', 'vision', 'change'],
  },
  {
    id: 'mark-11-24',
    ref: 'Mark 11:24',
    text: 'Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.',
    reading: 'The heart of Neville’s teaching: believe that you have received, in the present tense, and live from that feeling.',
    tags: ['abundance', 'manifestation', 'faith'],
  },
  {
    id: 'luke-17-21',
    ref: 'Luke 17:21',
    text: 'Neither shall they say, Lo here! or, lo there! for, behold, the kingdom of God is within you.',
    excerpt: 'the kingdom of God is within you.',
    reading: 'Not here, not there, but within. Mystics from Meister Eckhart to Neville took this inwardly: the kingdom is a state of consciousness, open now.',
    tags: ['inner', 'stillness', 'compassion'],
  },
  {
    id: 'john-10-34',
    ref: 'John 10:34',
    text: 'Jesus answered them, Is it not written in your law, I said, Ye are gods?',
    reading: 'Jesus quotes Psalm 82 back to his critics. Esoteric readers hear an invitation to recognize the creative power already in you.',
    tags: ['manifestation', 'imagination'],
  },
  {
    id: 'romans-4-17',
    ref: 'Romans 4:17',
    text: '(As it is written, I have made thee a father of many nations,) before him whom he believed, even God, who quickeneth the dead, and calleth those things which be not as though they were.',
    excerpt: 'calleth those things which be not as though they were.',
    reading: 'Paul describes speaking of what is not yet as if it already were. This is the core of “living in the end”: assuming the fulfilled state before the evidence arrives.',
    tags: ['beginnings', 'manifestation', 'imagination'],
  },
  {
    id: 'romans-12-2',
    ref: 'Romans 12:2',
    text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.',
    excerpt: 'be ye transformed by the renewing of your mind',
    reading: 'Transformation starts in the mind. Change the inner pattern and the life that grows from it changes too.',
    tags: ['change', 'release'],
  },
  {
    id: '2-corinthians-4-18',
    ref: '2 Corinthians 4:18',
    text: 'While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal; but the things which are not seen are eternal.',
    reading: 'Attention placed on the unseen: the inner image and the assumption, rather than the passing look of things.',
    tags: ['vision', 'imagination', 'inner'],
  },
  {
    id: 'philippians-3-13-14',
    ref: 'Philippians 3:13–14',
    text: 'Brethren, I count not myself to have apprehended: but this one thing I do, forgetting those things which are behind, and reaching forth unto those things which are before, I press toward the mark for the prize of the high calling of God in Christ Jesus.',
    excerpt: 'forgetting those things which are behind, and reaching forth unto those things which are before',
    reading: 'Let the old story go and lean toward what is ahead. Neville’s nightly revision works in the same direction.',
    tags: ['release', 'change'],
  },
  {
    id: 'philippians-4-8',
    ref: 'Philippians 4:8',
    text: 'Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.',
    excerpt: 'think on these things.',
    reading: 'A mental diet in one verse: choose what you dwell on. Not denial of what is hard, but deliberate attention to what is good.',
    tags: ['expression', 'inner'],
  },
  {
    id: 'hebrews-11-1',
    ref: 'Hebrews 11:1',
    text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
    reading: 'Faith is called the substance of what is hoped for: an inner reality that comes before the outer evidence.',
    tags: ['vision', 'faith', 'manifestation'],
  },
  {
    id: 'hebrews-11-3',
    ref: 'Hebrews 11:3',
    text: 'Through faith we understand that the worlds were framed by the word of God, so that things which are seen were not made of things which do appear.',
    reading: 'What is seen came from what is not seen. Mystical readers take this as the pattern of every creation: the outer from the inner.',
    tags: ['manifestation', 'building'],
  },
  {
    id: 'james-1-6',
    ref: 'James 1:6',
    text: 'But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed.',
    reading: 'A divided mind is tossed like a wave. Asking without wavering means choosing one inner state and staying with it.',
    tags: ['faith', 'building'],
  },
  {
    id: '1-john-4-18',
    ref: '1 John 4:18',
    text: 'There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.',
    excerpt: 'There is no fear in love; but perfect love casteth out fear',
    reading: 'Love and fear cannot share a room for long. Where love is real, fear loses its grip, in a relationship and inside yourself.',
    tags: ['love', 'compassion', 'release', 'partnership'],
  },
];

export const verseById = (id: string): Verse => {
  const v = SCRIPTURE.find((s) => s.id === id);
  if (!v) throw new Error(`Unknown verse ${id}`);
  return v;
};

export type MindKey = { theme: ScriptureTheme; verse: string; practice: PracticeId };

/** A verse and an imagination practice for each number, chosen to match its theme. */
export const MIND_BY_NUMBER: Record<number, MindKey> = {
  1: { theme: 'beginnings', verse: 'romans-4-17', practice: 'end' },
  2: { theme: 'partnership', verse: 'matthew-18-19', practice: 'scene' },
  3: { theme: 'expression', verse: 'proverbs-18-21', practice: 'diet' },
  4: { theme: 'building', verse: 'habakkuk-2-2-3', practice: 'end' },
  5: { theme: 'change', verse: 'romans-12-2', practice: 'revision' },
  6: { theme: 'love', verse: '1-john-4-18', practice: 'scene' },
  7: { theme: 'inner', verse: 'luke-17-21', practice: 'iam' },
  8: { theme: 'abundance', verse: 'mark-11-24', practice: 'scene' },
  9: { theme: 'release', verse: 'philippians-3-13-14', practice: 'revision' },
  11: { theme: 'vision', verse: 'hebrews-11-1', practice: 'scene' },
  22: { theme: 'manifestation', verse: 'hebrews-11-3', practice: 'end' },
  33: { theme: 'compassion', verse: 'matthew-9-29', practice: 'iam' },
};

/** Compounds reduce first (29 → 11). */
export const mindFor = (value: number): MindKey => MIND_BY_NUMBER[value] ?? MIND_BY_NUMBER[reduce(value).value];

/** One verse per day, stable for the date, drawn from the verses that share the number's theme. */
export function verseOfDay(date: string, number: number): Verse {
  const theme = mindFor(number).theme;
  const pool = SCRIPTURE.filter((v) => v.tags.includes(theme));
  return pool[hash(`verse-${date}`) % pool.length];
}

/** The part of a verse to show when space is short. */
export const quoteOf = (v: Verse): string => v.excerpt ?? v.text;
