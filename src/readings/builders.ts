import { ARCHETYPES, type ArchetypeId } from '@/content/archetypes';
import { ANIMAL_MEANINGS, ELEMENT_MEANINGS } from '@/content/chineseSigns';
import { DAY_GUIDANCE, MOON_GUIDANCE, PERSONAL_YEAR_THEMES } from '@/content/dayGuidance';
import { FUNCTION_MEANINGS } from '@/content/functions';
import { KARMIC_MEANINGS, meaningFor } from '@/content/numbers';
import { SIGN_MEANINGS } from '@/content/westernSigns';
import { bestDates, INTENTS, type Intent } from '@/engines/bestDate';
import { allies, chineseSign, enemy, relation, type ChineseSign } from '@/engines/chinese';
import { compatibility, type CompatLabel } from '@/engines/compatibility';
import { numberHarmony, type Harmony } from '@/engines/harmony';
import { nameNumbers, type LetterSystem } from '@/engines/letterology';
import { personalDay, personalMonth, personalYear, type Reduced } from '@/engines/numerology';
import { buildProfile, type Profile } from '@/engines/profile';
import { energyEvents, energyFor, forecast, RELATION_LABEL } from '@/engines/timing';
import { signDistance, type WesternSign } from '@/engines/western';
import type { AlignmentResult, ArchetypeResult, TypesResult } from '@/jung/types';
import { addDays, formatDate, monthName, parseYMD, weekday } from '@/lib/date';
import { withMind } from '@/readings/mind';
import type { ReadingDoc, ReadingSection } from '@/readings/types';

// ── shared phrasing ─────────────────────────────────────────────────────────
const westernLine = (w: WesternSign) => `${w.sign} (${w.element}, ${w.modality})`;
const chineseLine = (c: ChineseSign) => `${c.element} ${c.animal}`;
const dayLabel = (date: string) => `${weekday(date)} ${formatDate(date)}`;

function karmicNote(r: Reduced): string {
  return r.karmicDebt ? ` Karmic debt ${r.karmicDebt}: ${KARMIC_MEANINGS[r.karmicDebt].lesson}` : '';
}

const HARMONY_TEXT: Record<Harmony, string> = {
  same: 'mirrors your Life Path: strong, familiar energy',
  family: 'shares your number family: an easy fit',
  friction: 'pulls against your Life Path: a name that challenges you',
  neutral: 'sits neutrally beside your Life Path',
};

const COMPAT_TEXT: Record<CompatLabel, string> = {
  Strong: 'Your patterns support each other naturally. Ease is likely, though ease is not the same as depth.',
  Good: 'More alignment than friction: a workable, often energizing pairing.',
  Mixed: 'A blend of support and friction. This pairing asks for awareness and honest communication.',
  Friction: 'Your patterns pull in different directions. Friction can still be fruitful, but expect to work at it.',
};

const WESTERN_ANGLE: Record<number, string> = {
  0: 'Same sign: you understand each other instinctively, and share the same blind spots.',
  1: 'Neighboring signs: different temperaments that can learn from each other with patience.',
  2: 'A sextile: friendly, cooperative elements that encourage each other.',
  3: 'A square: real tension between your styles, which can drive growth if you meet it honestly.',
  4: 'A trine: the same element, so you flow together easily.',
  5: 'A quincunx: an awkward angle that needs constant small adjustments.',
  6: 'Opposites: magnetic and mirror-like, each holding what the other lacks.',
};

// ── date & name ─────────────────────────────────────────────────────────────
export function dateReading(date: string, label?: string): ReadingDoc {
  const p = buildProfile({ name: '', birthDate: date });
  const lp = meaningFor(p.lifePath.value);
  const sign = SIGN_MEANINGS[p.western.sign];
  const animal = ANIMAL_MEANINGS[p.chinese.animal];
  const friends = allies(p.chinese.animal);
  return withMind({
    type: 'date',
    title: label || formatDate(date),
    subtitle: label ? formatDate(date) : 'Date calculator',
    sections: [
      {
        heading: `Life Path ${p.lifePath.display} · ${lp.title}`,
        body: `${lp.light} In shadow: ${lp.shadow.charAt(0).toLowerCase()}${lp.shadow.slice(1)}${karmicNote(p.lifePath)}`,
        chips: lp.keywords,
      },
      {
        heading: `${p.western.glyph} ${p.western.sign}`,
        body: `${p.western.element}, ${p.western.modality}, ruled by ${p.western.ruler}. ${sign.light}${p.western.cuspWith ? ` Born on the cusp with ${p.western.cuspWith}.` : ''}`,
        chips: sign.traits,
      },
      {
        heading: `${chineseLine(p.chinese)} (${p.chinese.polarity})`,
        body: `${animal.light} ${ELEMENT_MEANINGS[p.chinese.element].nature}`,
        chips: [`Allies: ${friends.join(', ')}`, `Clash: ${enemy(p.chinese.animal)}`],
      },
    ],
    facts: {
      subject: label || formatDate(date),
      date,
      lifePath: p.lifePath.display,
      lifePathTitle: lp.title,
      western: westernLine(p.western),
      chinese: chineseLine(p.chinese),
      allies: friends,
      clash: enemy(p.chinese.animal),
    },
  }, p.lifePath.value);
}

export function nameReading(names: string[], system: LetterSystem = 'pythagorean', lifePathRoot?: number): ReadingDoc {
  const sections: ReadingSection[] = [];
  const facts: ReadingDoc['facts'] = { system };
  const ranked: { name: string; harmony: Harmony }[] = [];
  for (const name of names.filter((n) => n.trim())) {
    let n;
    try {
      n = nameNumbers(name, system);
    } catch {
      continue;
    }
    const ex = meaningFor(n.expression.value);
    const su = meaningFor(n.soulUrge.value);
    const pe = meaningFor(n.personality.value);
    const harmony = lifePathRoot ? numberHarmony(n.expression.root, lifePathRoot) : null;
    if (harmony) ranked.push({ name, harmony });
    sections.push({
      heading: name,
      body:
        `Expression ${n.expression.display}, ${ex.title}: ${ex.light} ` +
        `Soul Urge ${n.soulUrge.display}, ${su.title}: what you long for underneath. ` +
        `Personality ${n.personality.display}, ${pe.title}: how you come across at first.` +
        (harmony ? ` This name ${HARMONY_TEXT[harmony]}.` : ''),
      chips: [
        `Expression ${n.expression.display}`,
        `Soul Urge ${n.soulUrge.display}`,
        `Personality ${n.personality.display}`,
        `Cornerstone ${n.cornerstone}`,
        n.karmicLessons.length ? `Karmic lessons ${n.karmicLessons.join(', ')}` : 'No karmic lessons',
      ],
    });
    facts[name] = `Expression ${n.expression.display}, Soul Urge ${n.soulUrge.display}, Personality ${n.personality.display}, hidden passion ${n.hiddenPassion.join('/')}`;
  }
  if (ranked.length > 1) {
    const order: Harmony[] = ['family', 'same', 'neutral', 'friction'];
    const best = [...ranked].sort((a, b) => order.indexOf(a.harmony) - order.indexOf(b.harmony))[0];
    sections.push({ heading: 'Comparing names', body: `${best.name} sits most easily with your Life Path; it ${HARMONY_TEXT[best.harmony]}.` });
  }
  return { type: 'name', title: names.length > 1 ? 'Name comparison' : names[0] || 'Name reading', subtitle: 'Letterology', sections, facts };
}

// ── you ─────────────────────────────────────────────────────────────────────
type Quizzes = { types?: TypesResult | null; archetypes?: ArchetypeResult | null; alignment?: AlignmentResult | null };

export function fullReading(p: Profile, quizzes: Quizzes, today: string): ReadingDoc {
  const { y, m } = parseYMD(today);
  const lp = meaningFor(p.lifePath.value);
  const bd = meaningFor(p.birthday.value);
  const at = meaningFor(p.attitude.value);
  const sign = SIGN_MEANINGS[p.western.sign];
  const animal = ANIMAL_MEANINGS[p.chinese.animal];
  const py = personalYear(p.birthDate, y);
  const pm = personalMonth(p.birthDate, y, m);
  const pd = personalDay(p.birthDate, today);
  const sections: ReadingSection[] = [
    { heading: `Life Path ${p.lifePath.display} · ${lp.title}`, body: `${lp.light}${karmicNote(p.lifePath)}`, chips: lp.keywords },
    {
      heading: `Birthday ${p.birthday.display} · Attitude ${p.attitude.display}`,
      body: `Your birthday number adds the note of ${bd.title} (${bd.keywords.slice(0, 2).join(', ')}). Your attitude number, how you come across at first, is ${at.title}.${karmicNote(p.birthday)}`,
    },
  ];
  if (p.letters) {
    const ex = meaningFor(p.letters.expression.value);
    const su = meaningFor(p.letters.soulUrge.value);
    sections.push({
      heading: `Your name · ${p.birthName}`,
      body: `Expression ${p.letters.expression.display}, ${ex.title}: the talents your name carries. Soul Urge ${p.letters.soulUrge.display}, ${su.title}: what you long for underneath. Your name ${HARMONY_TEXT[numberHarmony(p.letters.expression.root, p.lifePath.root)]}.`,
      chips: [`Expression ${p.letters.expression.display}`, `Soul Urge ${p.letters.soulUrge.display}`, `Personality ${p.letters.personality.display}`],
    });
  }
  sections.push(
    {
      heading: `${p.western.glyph} ${p.western.sign} · ${p.western.element}`,
      body: `${sign.light}${p.western.cuspWith ? ` You were born on the cusp with ${p.western.cuspWith}.` : ''} ${sign.jungNote}`,
      chips: sign.traits,
    },
    {
      heading: `${chineseLine(p.chinese)} (${p.chinese.polarity})`,
      body: `${animal.light} ${ELEMENT_MEANINGS[p.chinese.element].nature} Your allies are the ${allies(p.chinese.animal).join(', ')}; your clash sign is the ${enemy(p.chinese.animal)}.`,
      chips: animal.traits,
    },
    {
      heading: 'Your cycles right now',
      body: `Personal Year ${py.display}: ${PERSONAL_YEAR_THEMES[py.root]} This month is a ${pm.display}, ${meaningFor(pm.value).title}; today is a ${pd.display}, ${meaningFor(pd.value).title}.`,
    },
  );
  if (quizzes.types) {
    const t = quizzes.types;
    sections.push({
      heading: `Type · ${FUNCTION_MEANINGS[t.dominant].name}`,
      body: `${FUNCTION_MEANINGS[t.dominant].whenDominant} Your auxiliary is ${FUNCTION_MEANINGS[t.auxiliary].name}. Your inferior function, ${FUNCTION_MEANINGS[t.inferior].name}, is where the shadow tends to enter: ${FUNCTION_MEANINGS[t.inferior].whenInferior}`,
      chips: [t.dominant, t.auxiliary, `Inferior ${t.inferior}`, t.code],
    });
  }
  if (quizzes.archetypes) {
    const top = quizzes.archetypes.top.map((id) => ARCHETYPES[id as ArchetypeId]).filter(Boolean);
    if (top.length) {
      sections.push({
        heading: `Archetypes · ${top.map((a) => a.name).join(', ')}`,
        body: `Your leading archetype, the ${top[0].name}, is driven ${top[0].drive.charAt(0).toLowerCase()}${top[0].drive.slice(1)}. Its gift is ${top[0].gift.toLowerCase()}; its shadow form is ${top[0].shadowForm.charAt(0).toLowerCase()}${top[0].shadowForm.slice(1)}.`,
        chips: top.map((a) => a.name),
      });
    }
  }
  if (quizzes.alignment) {
    sections.push({ heading: `Persona and Self · ${quizzes.alignment.percent}%`, body: quizzes.alignment.tier });
  }
  sections.push({
    heading: 'Your shadow side',
    body: `Number: ${lp.shadow} Sign: ${sign.shadow} Animal: ${animal.shadow}${quizzes.types ? ` Inferior function: ${FUNCTION_MEANINGS[quizzes.types.inferior].whenInferior}` : ''}`,
  });
  return withMind({
    type: 'full',
    title: p.name ? `${p.name}’s full reading` : 'Your full reading',
    subtitle: 'Numbers, signs and psyche, read together',
    sections,
    facts: {
      name: p.name,
      born: p.birthDate,
      lifePath: p.lifePath.display,
      lifePathTitle: lp.title,
      birthday: p.birthday.display,
      attitude: p.attitude.display,
      ...(p.letters
        ? { expression: p.letters.expression.display, soulUrge: p.letters.soulUrge.display, personality: p.letters.personality.display }
        : {}),
      western: westernLine(p.western),
      chinese: chineseLine(p.chinese),
      allies: allies(p.chinese.animal),
      clash: enemy(p.chinese.animal),
      personalYear: py.display,
      personalMonth: pm.display,
      personalDay: pd.display,
      ...(quizzes.types
        ? { type: `dominant ${quizzes.types.dominant}, auxiliary ${quizzes.types.auxiliary}, inferior ${quizzes.types.inferior} (${quizzes.types.code})` }
        : {}),
      ...(quizzes.archetypes ? { archetypes: quizzes.archetypes.top } : {}),
      ...(quizzes.alignment ? { alignment: `${quizzes.alignment.percent}%` } : {}),
    },
  }, p.lifePath.value);
}

// ── timing ──────────────────────────────────────────────────────────────────
export function dailyReading(p: Profile, date: string): ReadingDoc {
  const e = energyFor(p, date);
  const g = DAY_GUIDANCE[e.personalDay];
  const rel = relation(e.userAnimal, e.dayAnimal);
  return withMind({
    type: 'daily',
    title: dayLabel(date),
    subtitle: 'Daily reading',
    sections: [
      {
        heading: `Energy ${e.score} · ${e.label}`,
        body: e.factors.length ? e.factors.map((f) => `${f.delta > 0 ? '+' : ''}${f.delta} ${f.label}`).join('\n') : 'A quiet, neutral day: nothing strongly for or against you.',
      },
      {
        heading: `Personal day ${e.personalDayDisplay} · ${meaningFor(e.personalDay).title}`,
        body: `Best for ${g.bestFor.join(', ').toLowerCase()}. Watch out for ${g.watchOut.join(' and ').toLowerCase()}.`,
        chips: g.bestFor,
      },
      { heading: e.moon, body: MOON_GUIDANCE[e.moon] },
      { heading: `${e.dayAnimal} day`, body: `For your ${e.userAnimal}, the ${e.dayAnimal} is ${RELATION_LABEL[rel]}.` },
      { heading: 'Reflection', body: g.reflection },
    ],
    facts: {
      date,
      energy: `${e.score} (${e.label})`,
      personalDay: e.personalDayDisplay,
      universalDay: e.universalDayDisplay,
      moon: e.moon,
      dayAnimal: `${e.dayAnimal} (${RELATION_LABEL[rel]} for a ${e.userAnimal})`,
      factors: e.factors.map((f) => `${f.delta > 0 ? '+' : ''}${f.delta} ${f.label}`),
    },
  }, e.personalDay);
}

export function weekReading(p: Profile, start: string): ReadingDoc {
  const days = forecast(p, start, 7);
  const best = days.reduce((a, b) => (b.score > a.score ? b : a));
  const hardest = days.reduce((a, b) => (b.score < a.score ? b : a));
  const events = energyEvents(p, start, 7);
  const lines = days.map((d) => `${dayLabel(d.date)} · ${d.score} ${d.label} · personal day ${d.personalDayDisplay}`);
  return withMind({
    type: 'week',
    title: `Week of ${formatDate(start)}`,
    subtitle: '7-day forecast',
    sections: [
      { heading: 'The week at a glance', body: `Strongest day: ${dayLabel(best.date)} (${best.score}). Most demanding: ${dayLabel(hardest.date)} (${hardest.score}).` },
      { heading: 'Day by day', body: lines.join('\n') },
      { heading: 'Energy Events', body: events.length ? events.map((ev) => `${dayLabel(ev.date)}: ${ev.title}${ev.detail ? ` (${ev.detail})` : ''}`).join('\n') : 'No major events this week.' },
    ],
    facts: {
      start,
      days: lines,
      best: `${best.date} (${best.score})`,
      hardest: `${hardest.date} (${hardest.score})`,
      events: events.map((ev) => `${ev.date}: ${ev.title}`),
    },
  }, personalDay(p.birthDate, start).value);
}

export function yearReading(p: Profile, year: number): ReadingDoc {
  const py = personalYear(p.birthDate, year);
  const lunar = chineseSign(`${year}-06-15`);
  const rel = relation(p.chinese.animal, lunar.animal);
  const months = Array.from({ length: 12 }, (_, i) => {
    const pm = personalMonth(p.birthDate, year, i + 1);
    return `${monthName(i + 1)}: ${pm.display} · ${meaningFor(pm.value).title}`;
  });
  return withMind({
    type: 'year',
    title: `${year} for ${p.name || 'you'}`,
    subtitle: 'Year ahead',
    sections: [
      { heading: `Personal Year ${py.display}`, body: `${PERSONAL_YEAR_THEMES[py.root]} ${meaningFor(py.value).light}` },
      { heading: 'Month by month', body: months.join('\n') },
      {
        heading: `Year of the ${lunar.element} ${lunar.animal}`,
        body: `From Lunar New Year, ${year} belongs to the ${lunar.element} ${lunar.animal}. For your ${p.chinese.animal}, it is ${RELATION_LABEL[rel]}.`,
      },
    ],
    facts: { year, personalYear: py.display, theme: PERSONAL_YEAR_THEMES[py.root], months, yearAnimal: lunar.animal, yearElement: lunar.element, forYou: RELATION_LABEL[rel] },
  }, py.value);
}

export function bestDateReading(p: Profile, intent: Intent, start: string, days: number): ReadingDoc {
  const ranked = bestDates(p, intent, start, days);
  const lines = ranked.map((d) => `${dayLabel(d.date)} · ${d.total}${d.reasons.length ? ` · ${d.reasons.join('; ')}` : ''}`);
  return withMind({
    type: 'bestDate',
    title: `Best days to ${INTENTS[intent].toLowerCase()}`,
    subtitle: `${formatDate(start)} to ${formatDate(addDays(start, days - 1))}`,
    sections: [
      { heading: 'Top days', body: lines.join('\n') },
      { heading: 'How these were chosen', body: 'Each day starts from your Energy score, then gains or loses points for what this intention needs: the right personal day, the moon phase, and whether the day’s animal is an ally or your clash.' },
    ],
    facts: { intent: INTENTS[intent], from: start, days, top: lines },
  }, p.lifePath.value);
}

// ── relationships ───────────────────────────────────────────────────────────
// Compatibility always reads key 2 (partnership → Matthew 18:19), whatever the two Life Paths are.
export function compatibilityReading(a: Profile, b: Profile, labels: { a: string; b: string }): ReadingDoc {
  const c = compatibility(a, b);
  const d = signDistance(a.western.sign, b.western.sign);
  const h = numberHarmony(a.lifePath.root, b.lifePath.root);
  return withMind({
    type: 'compatibility',
    title: `${labels.a} & ${labels.b}`,
    subtitle: 'Compatibility',
    sections: [
      { heading: `${c.overall}% · ${c.label}`, body: `${COMPAT_TEXT[c.label]} Chinese ${c.chinese}, Western ${c.western}, Numerology ${c.numerology}.` },
      { heading: `Chinese · ${a.chinese.animal} & ${b.chinese.animal}`, body: `For the ${a.chinese.animal}, the ${b.chinese.animal} is ${RELATION_LABEL[c.chineseRelation]}. Elements: ${a.chinese.element} and ${b.chinese.element}.` },
      { heading: `Western · ${a.western.sign} & ${b.western.sign}`, body: WESTERN_ANGLE[d] },
      { heading: `Numbers · ${a.lifePath.display} & ${b.lifePath.display}`, body: `These Life Paths are ${h === 'same' ? 'the same number' : h === 'family' ? 'in the same family' : h === 'friction' ? 'a friction pair' : 'neutral toward each other'}.` },
      { heading: 'Where you align', body: c.aligned.length ? c.aligned.join('\n') : 'No strong alignments: this pairing is neutral ground.' },
      { heading: 'Where friction shows up', body: c.friction.length ? c.friction.join('\n') : 'No major friction points.' },
    ],
    facts: {
      a: labels.a,
      b: labels.b,
      overall: c.overall,
      label: c.label,
      chinese: c.chinese,
      western: c.western,
      numerology: c.numerology,
      chineseRelation: RELATION_LABEL[c.chineseRelation],
      aligned: c.aligned,
      friction: c.friction,
      aPattern: `${a.lifePath.display}, ${westernLine(a.western)}, ${chineseLine(a.chinese)}`,
      bPattern: `${b.lifePath.display}, ${westernLine(b.western)}, ${chineseLine(b.chinese)}`,
    },
  }, 2);
}

export function familyReading(members: { name: string; relation: string; profile: Profile }[]): ReadingDoc {
  const pairs: { text: string; overall: number }[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const c = compatibility(members[i].profile, members[j].profile);
      pairs.push({ text: `${members[i].name} & ${members[j].name}: ${c.overall}% ${c.label}`, overall: c.overall });
    }
  }
  const sorted = [...pairs].sort((a, b) => b.overall - a.overall);
  const sections: ReadingSection[] = pairs.length
    ? [
        { heading: 'Strongest bond', body: sorted[0].text },
        { heading: 'Most friction', body: sorted[sorted.length - 1].text },
        { heading: 'Every pair', body: sorted.map((p) => p.text).join('\n') },
      ]
    : [{ heading: 'Add people', body: 'Add at least two people to see how your circle fits together.' }];
  return {
    type: 'family',
    title: 'Family & circle',
    subtitle: `${members.length} people`,
    sections,
    facts: {
      members: members.map((m) => `${m.name} (${m.relation}): ${m.profile.lifePath.display}, ${m.profile.western.sign}, ${chineseLine(m.profile.chinese)}`),
      pairs: sorted.map((p) => p.text),
    },
  };
}

// ── Jung ────────────────────────────────────────────────────────────────────
export function typeReading(r: TypesResult): ReadingDoc {
  const dom = FUNCTION_MEANINGS[r.dominant];
  const aux = FUNCTION_MEANINGS[r.auxiliary];
  const inf = FUNCTION_MEANINGS[r.inferior];
  const depth = r.depth ?? 'full';
  const sections: ReadingSection[] = [
    { heading: `Dominant · ${dom.name}`, body: `${dom.essence} ${dom.whenDominant}` },
    { heading: `Auxiliary · ${aux.name}`, body: `${aux.essence} It supports and balances your dominant function.` },
    { heading: `Inferior · ${inf.name}`, body: `${inf.whenInferior} ${inf.growthEdge}` },
  ];
  if (r.confidence === 'low') {
    sections.push({
      heading: 'How sure is this?',
      body: 'Many answers fit neither choice, or two functions came out level, so treat this result as tentative. That is useful in itself: Jung saw the types as tendencies, not boxes.',
    });
  }
  if (depth === 'quick') {
    sections.push({
      heading: 'A quick read',
      body: 'This came from 10 questions, so it is a first sketch. Take the deep dive for a more precise read, especially of your inferior function.',
    });
  }
  return {
    type: 'type',
    title: dom.name,
    subtitle: `Psychological type · ${r.code}`,
    sections,
    facts: {
      dominant: dom.name,
      auxiliary: aux.name,
      inferior: inf.name,
      code: r.code,
      scores: Object.entries(r.scores).map(([k, v]) => `${k} ${v}`),
      depth: depth === 'quick' ? 'quick read (10 questions)' : 'deep dive (32 questions)',
      ...(r.confidence ? { confidence: r.confidence } : {}),
    },
  };
}

export function archetypeReading(r: ArchetypeResult): ReadingDoc {
  const top = r.top.map((id) => ARCHETYPES[id as ArchetypeId]).filter(Boolean);
  return {
    type: 'archetype',
    title: top.map((a) => a.name).join(' · ') || 'Archetypes',
    subtitle: 'Archetype profile',
    sections: [
      ...top.map((a, i) => ({ heading: `${i === 0 ? 'Leading' : i === 1 ? 'Second' : 'Third'} · ${a.name}`, body: `Driven ${a.drive.charAt(0).toLowerCase()}${a.drive.slice(1)}. Gift: ${a.gift.toLowerCase()}. Fear: ${a.fear.toLowerCase()}. ${a.jungNote}` })),
      { heading: 'Shadow form', body: r.shadowForm },
    ],
    facts: { archetypes: top.map((a) => a.name), shadowForm: r.shadowForm },
  };
}

export function alignmentReading(r: AlignmentResult): ReadingDoc {
  return {
    type: 'alignment',
    title: `Alignment ${r.percent}%`,
    subtitle: 'Persona and Self',
    sections: [
      { heading: r.tier, body: 'This compares how you described yourself today with the traits your birth pattern suggests. A gap is not a failure: in Jung’s terms it may point to a persona you have outgrown, or to parts of yourself still waiting to be lived.' },
    ],
    facts: { alignment: `${r.percent}%`, tier: r.tier, takenAt: r.takenAt },
  };
}
