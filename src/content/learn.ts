export type LearnGroup = 'Numbers' | 'Signs' | 'Timing' | 'Method' | 'Jung' | 'Mind & Scripture';
export type LearnLabel = 'Tradition' | 'Method' | 'Research says' | 'Jung';
export type LearnArticle = { slug: string; title: string; group: LearnGroup; label: LearnLabel; summary: string; paragraphs: string[] };

const A = (slug: string, title: string, group: LearnGroup, label: LearnLabel, summary: string, paragraphs: string[]): LearnArticle => ({
  slug, title, group, label, summary, paragraphs,
});

export const LEARN_ARTICLES: LearnArticle[] = [
  // ── Numbers ───────────────────────────────────────────────────────────────
  A('numerology-basics', 'What numerology is', 'Numbers', 'Tradition', 'Numbers as symbols, and how Esoterica reads them.', [
    'Numerology treats numbers as symbols with qualities, not only as quantities. The idea is ancient: the Pythagorean school taught that number underlies the order of the cosmos. Modern numerology turns names and dates into a handful of numbers that are read like a vocabulary of character and timing.',
    'Esoterica follows the method popularized by modern numerologists and used by CUE: add every digit of a date together, then keep adding the digits of the result until a single digit remains. The exceptions are the master numbers 11, 22 and 33, which are kept as they are.',
    'Esoterica shows the total before reduction as well, written like 28/1. That first total is the compound number. It adds nuance, and four compounds (13, 14, 16 and 19) are read as karmic debt numbers.',
    'Treat the numbers as a mirror, not a verdict. They give you words for patterns you may already sense; you decide what fits.',
  ]),
  A('life-path', 'Your Life Path', 'Numbers', 'Tradition', 'The core number of your birthday.', [
    'The Life Path is the central number in numerology: the theme your life keeps returning to. It is calculated from your full date of birth.',
    'Example: Apple was founded on 1 April 1976. Adding every digit gives 1 + 9 + 7 + 6 + 0 + 4 + 0 + 1 = 28, and 2 + 8 = 10, and 1 + 0 = 1. Esoterica writes this as 28/1: compound 28, Life Path 1.',
    'If the sum lands on 11, 22 or 33 along the way, it stops there. Someone born on 14 May 1990 adds up to 29, then 11, so their Life Path is 29/11, a master number.',
    'Read your Life Path as a direction rather than a destiny. Each number has a light side and a shadow side, and in Jungian terms the shadow side is just as much a part of the path.',
  ]),
  A('master-numbers', 'Master numbers 11, 22, 33', 'Numbers', 'Tradition', 'Intensified numbers, and why they can feel heavy.', [
    'Master numbers are the doubled digits 11, 22 and 33. Numerology treats them as intensified versions of their roots: 11 carries the sensitivity of 2, 22 the building power of 4, and 33 the care of 6.',
    'People with master numbers often describe them as pressure as much as gift: a sense of a large potential that is hard to live up to. In Jungian language the danger is inflation, identifying with a grand image instead of growing into it slowly.',
    'When Esoterica compares numbers (for timing and compatibility) it uses the root: 11 counts as 2, 22 as 4 and 33 as 6. Two master numbers together earn a small compatibility bonus.',
  ]),
  A('karmic-debt', 'Karmic debt numbers', 'Numbers', 'Tradition', '13, 14, 16 and 19 as lessons.', [
    'In numerology, the compound numbers 13, 14, 16 and 19 are called karmic debt numbers. Esoterica flags them when they appear anywhere while a number is being reduced, for example 49 → 13 → 4.',
    '13 points to effort over shortcuts, 14 to freedom with moderation, 16 to humility and rebuilding after a fall, and 19 to independence that can still receive help.',
    'Think of them as recurring lessons rather than punishments. A Jungian reading would ask where the same situation keeps returning, and what part of you it is asking to develop.',
  ]),
  A('personal-cycles', 'Personal Year, Month and Day', 'Timing', 'Tradition', 'The nine-year cycle and how each day is numbered.', [
    'Numerology describes life as moving through nine-year cycles. Your Personal Year is your birth month plus your birth day plus the current year, reduced. It changes every 1 January.',
    'Your Personal Month adds the calendar month to your Personal Year, and your Personal Day adds the calendar day to your Personal Month. The Universal Day is simply every digit of the date added together: the same for everyone.',
    'Year 1 is for beginnings, 2 for patience and partnership, 3 for expression, 4 for building, 5 for change, 6 for responsibility and home, 7 for reflection, 8 for power and results, and 9 for completion and release.',
    'Esoterica uses your Personal Day and the Universal Day in your daily Energy score, and shows the Personal Year in your profile and in the year-ahead reading.',
  ]),
  A('letterology', 'Letterology: the numbers in a name', 'Numbers', 'Tradition', 'Expression, Soul Urge, Personality and more.', [
    'Letterology turns the letters of a name into numbers. Esoterica uses the Pythagorean table by default: A to I are 1 to 9, J to R are 1 to 9 again, and S to Z are 1 to 8. You can switch to the older Chaldean table in the name reading.',
    'Your Expression number adds every letter of your full birth name. Your Soul Urge adds only the vowels (inner motivation) and your Personality adds only the consonants (how you come across). Y counts as a vowel unless the next letter is a vowel.',
    'The Cornerstone is the first letter of your first name, the Capstone the last. Hidden Passion is the number that appears most often in your name, and Karmic Lessons are the numbers that never appear at all.',
    'Name readings are useful for comparing nicknames, married names or business names. Esoterica also checks how each name harmonizes with your Life Path.',
  ]),
  // ── Signs ─────────────────────────────────────────────────────────────────
  A('western-signs', 'Western Sun signs', 'Signs', 'Tradition', 'The tropical zodiac and how Esoterica finds your sign.', [
    'Your Sun sign is the twelfth of the sky the Sun appeared to occupy on the day you were born, measured in the tropical zodiac that starts at the spring equinox.',
    'Instead of a fixed table of dates, Esoterica calculates where the Sun actually was at midday on your birth date. If that position is within one degree of the next sign, Esoterica marks you as born on the cusp, because your exact birth time would decide the sign.',
    'Without a birth time and place there is no Moon sign or Rising sign, so Esoterica, like CUE, works with the Sun sign and its element, modality and ruling planet.',
  ]),
  A('elements-modalities', 'Elements, modalities and aspects', 'Signs', 'Tradition', 'Fire, Earth, Air, Water; Cardinal, Fixed, Mutable.', [
    'Each sign belongs to one of four elements. Fire (Aries, Leo, Sagittarius) is spirited, Earth (Taurus, Virgo, Capricorn) is practical, Air (Gemini, Libra, Aquarius) is mental and social, and Water (Cancer, Scorpio, Pisces) is emotional and intuitive.',
    'Each sign also has a modality. Cardinal signs start things, Fixed signs sustain them, and Mutable signs adapt and bridge.',
    'Compatibility in Esoterica looks at the angle between two signs. Signs four apart share an element (a trine) and flow easily; two apart (a sextile) cooperate; three apart (a square) create friction that can drive growth; six apart are opposites that attract and mirror each other.',
  ]),
  A('chinese-zodiac', 'The Chinese zodiac', 'Signs', 'Tradition', 'Twelve animals, five elements, yin and yang.', [
    'The Chinese zodiac assigns each lunar year one of twelve animals: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig. Each year also carries one of five elements (Wood, Fire, Earth, Metal, Water) and a yin or yang quality.',
    'The year changes at Lunar New Year, which falls between late January and mid-February. Esoterica checks your birth date against the real lunar calendar, so someone born on 9 February 2024 is a Water Rabbit while someone born on 10 February 2024 is a Wood Dragon.',
    'Days have animals too. The calendar cycles through sixty day-names, and Esoterica compares each day’s animal with yours as part of your Energy score.',
  ]),
  A('chinese-relations', 'Friendly signs and enemy signs', 'Signs', 'Tradition', 'Trines, secret friends, clashes, harms and punishments.', [
    'Trines are groups of three animals that naturally support each other: Rat, Dragon and Monkey; Ox, Snake and Rooster; Tiger, Horse and Dog; Rabbit, Goat and Pig.',
    'Each animal also has one secret friend: Rat and Ox, Tiger and Pig, Rabbit and Dog, Dragon and Rooster, Snake and Monkey, Horse and Goat.',
    'The clash, often called the enemy sign, is the animal directly opposite yours: Rat and Horse, Ox and Goat, Tiger and Monkey, Rabbit and Rooster, Dragon and Dog, Snake and Pig. Harm and punishment pairs describe smaller frictions.',
    'Esoterica counts ally days and clash days in your timing, and these relationships carry the most weight (40%) in compatibility.',
  ]),
  A('moon-phases', 'Moon phases', 'Timing', 'Tradition', 'From new to full and back again.', [
    'Every 29.5 days the Moon moves from new (dark) through first quarter, full, and last quarter back to new. Esoterica calculates the phase astronomically for each day.',
    'Traditionally the New Moon is for intentions and beginnings, the waxing Moon for building, the Full Moon for culmination and heightened feeling, and the waning Moon for release and rest.',
    'In your Energy score a New Moon adds a little, the waxing phase adds a little, and the waning phase subtracts a little. New and Full Moons also show up as Energy Events.',
  ]),
  // ── Method ────────────────────────────────────────────────────────────────
  A('how-esoterica-scores', 'How Esoterica scores days and matches', 'Method', 'Method', 'Every number behind your Energy and compatibility scores.', [
    'Energy score: every day starts at 50. Your Personal Day is compared with your Life Path: the same number adds 10, the same number family adds 8, and the friction pair subtracts 8. The number families are Mind (1, 5, 7), Builder (2, 4, 8) and Heart (3, 6, 9); Mind and Builder are the friction pair.',
    'The Universal Day adds 4 if it is in your family and subtracts 4 if it is in your friction family. The day’s Chinese animal adds 12 if it is your secret friend, 10 if it is in your trine and 4 if it is your own animal; it subtracts 5 for a punishment pair, 7 for a harm pair and 15 for your clash. The Moon adds 4 when new and 2 while waxing, and subtracts 2 while waning. A master-number day adds 3.',
    'The total is kept between 3 and 98 and labelled High (75+), Good (60+), Steady (45+), Low (30+) or Caution.',
    'Compatibility: the Chinese score (40%) starts from the animal relationship and adjusts for the five-element cycle. The numerology score (35%) compares Life Paths (70%) and birthday numbers (30%). The Western score (25%) comes from the angle between the two Sun signs. Strong is 80+, Good 65+, Mixed 50+, and Friction below that.',
    'These weights are Esoterica’s own design choices. They are not ancient law and they are not science. They are a consistent, transparent way to put the traditions side by side.',
  ]),
  A('what-research-says', 'What research says', 'Method', 'Research says', 'An honest note on evidence.', [
    'Controlled studies have not found that Sun signs or birth numbers predict personality or life outcomes. In a well-known double-blind test published in Nature in 1985, astrologers could not match birth charts to personality profiles better than chance, and large studies of people born minutes apart have not found them to be more alike than strangers.',
    'Psychology also explains why readings feel so personal. The Forer or Barnum effect describes how people rate general, flattering descriptions as uniquely accurate, especially when they believe the description was made for them.',
    'So why use these systems at all? Because a good symbol is a prompt for reflection. Jung himself treated astrology as a mirror of the psyche rather than a physical cause: a language of images that can help you notice what you already feel.',
    'Esoterica follows CUE’s stance: awareness, not prediction. Use readings to ask better questions, never to hand over your decisions.',
  ]),
  // ── Jung ──────────────────────────────────────────────────────────────────
  A('jung-life', 'Who was Carl Jung?', 'Jung', 'Jung', 'The psychiatrist behind analytical psychology.', [
    'Carl Gustav Jung was born on 26 July 1875 in Kesswil, Switzerland, and died on 6 June 1961 in Küsnacht on Lake Zurich. He studied medicine in Basel and trained as a psychiatrist at the Burghölzli clinic in Zurich under Eugen Bleuler.',
    'His word-association experiments led him to the idea of complexes, emotionally charged clusters in the psyche. He became close to Sigmund Freud from 1907, but they split around 1912–1913 when Jung’s ideas about the libido and the unconscious moved in a different direction.',
    'What followed was a period Jung called his confrontation with the unconscious, recorded in the illustrated Red Book (published only in 2009). Out of it came the ideas he spent the rest of his life developing: archetypes, the collective unconscious, psychological types and individuation.',
    'Jung built a stone tower at Bollingen, travelled to North Africa, New Mexico, Kenya and India, collaborated with the physicist Wolfgang Pauli on synchronicity, and wrote widely on dreams, religion and alchemy.',
  ]),
  A('psychological-types', 'Psychological types', 'Jung', 'Jung', 'Attitudes, functions, and your inferior function.', [
    'In Psychological Types (1921) Jung described two attitudes, extraversion (energy flowing toward the outer world) and introversion (energy flowing toward the inner world), and four functions: thinking and feeling, which judge, and sensation and intuition, which perceive.',
    'Combining them gives eight function-attitudes, such as Introverted Intuition or Extraverted Feeling. Most people lean on one dominant function, supported by an auxiliary one.',
    'The function opposite your dominant one is your inferior function. It is the least conscious, the most childlike, and often where the shadow enters: it shows up under stress, in moods and in sudden overreactions. Jung saw it as the doorway to growth.',
    'The Myers–Briggs Type Indicator later turned Jung’s ideas into a four-letter code. Esoterica’s quiz is its own, built on Jung’s descriptions, and shows a Myers–Briggs-style code only for reference.',
  ]),
  A('archetypes', 'Archetypes and the collective unconscious', 'Jung', 'Jung', 'Patterns older than any one life.', [
    'Jung proposed that beneath the personal unconscious lies a collective unconscious shared by all people. Its contents are archetypes: inherited patterns that shape how we imagine and experience the world, such as the mother, the hero, the trickster, the wise old man and the divine child.',
    'Archetypes are not images in themselves but tendencies to form images. They show up in myths, fairy tales, religions, dreams and in the stories we tell about our own lives.',
    'The twelve archetypes in Esoterica’s quiz (Hero, Sage, Caregiver and so on) come from a later popular model by Carol Pearson and Margaret Mark that builds on Jung. Jung’s own structural archetypes are the Persona, the Shadow, the Anima and Animus, and the Self.',
  ]),
  A('persona', 'The Persona', 'Jung', 'Jung', 'The mask we show the world.', [
    'The persona (from the Latin word for an actor’s mask) is the face we present to the world: our roles, manners and reputation. Everyone needs one; it lets us function in society.',
    'Trouble begins when we identify with the mask, believing we are only the competent professional, the fun friend or the perfect parent. Whatever does not fit the mask is pushed into the shadow.',
    'Esoterica’s Alignment quiz asks a Persona question: is the person you are being lined up with your birth pattern, or are you living a borrowed role?',
  ]),
  A('shadow', 'The Shadow', 'Jung', 'Jung', 'What we refuse to see in ourselves.', [
    'The shadow is everything about ourselves we do not want to know: the traits we disown, the impulses we were taught were bad, and also the strengths we were never allowed to live. It is the “gold in the shadow” as much as the darkness.',
    'We usually meet our shadow first in projection. The person who irritates us out of all proportion often carries something of our own that we have not accepted.',
    'Shadow work does not mean acting out everything we find. It means becoming conscious of it, so that it stops running us from behind. Esoterica’s daily prompts, the projection check and the Shadow conversation mode are built for this.',
  ]),
  A('anima-animus', 'Anima and Animus', 'Jung', 'Jung', 'The inner other.', [
    'Jung described the anima as the feminine image in a man’s psyche and the animus as the masculine image in a woman’s. A modern reading drops the strict gender rule: for anyone, this is the inner “other”, the figure of the soul that feels most unlike our conscious self.',
    'We tend to meet it in projection: falling for someone who seems to carry a magic we lack, or idealizing an artist or a muse. When the projection breaks, disappointment often follows.',
    'Taking the image back inward, through dreams, art and active imagination, deepens relationships, because we stop asking partners to be our soul for us.',
  ]),
  A('self-individuation', 'The Self and individuation', 'Jung', 'Jung', 'Becoming who you are.', [
    'For Jung the ego is only the center of consciousness. The Self is the center and the whole of the psyche, conscious and unconscious together. It often appears in dreams and art as circles, mandalas, precious stones or a divine child.',
    'Individuation is the lifelong process of becoming that whole person. It typically moves through recognizing the persona, facing the shadow, meeting the anima or animus, and coming into a living relationship with the Self.',
    'Esoterica’s Journey tracker follows those four stages, using your quizzes, journaling, dreams and synchronicities as milestones. It is a map for reflection, not a race.',
  ]),
  A('dreams-compensation', 'Dreams and compensation', 'Jung', 'Jung', 'How Jung read dreams.', [
    'Jung saw dreams as natural expressions of the unconscious, not disguises. Very often they compensate the conscious attitude: if you are overconfident, a dream may humble you; if you undervalue yourself, a dream may show you crowned.',
    'He read dream figures on two levels: objectively, as the real people they resemble, and subjectively, as parts of the dreamer. A dream about a reckless friend may be about your own recklessness, or your own unused boldness.',
    'Amplification means gathering associations: your personal ones first, then parallels from myth and symbolism. Dreams are best read in series, which is why Esoterica’s journal tracks recurring symbols over time.',
  ]),
  A('active-imagination', 'Active imagination', 'Jung', 'Jung', 'A waking dialogue with the unconscious.', [
    'Active imagination is a method Jung developed during his own confrontation with the unconscious. You start with an image (from a dream or a strong mood), let it move on its own, and then engage with it: speak to the figures, listen, respond.',
    'The key is to keep your own conscious position. You are not just watching a film or making things up on purpose; you are in a real exchange with something that is not your ego.',
    'Afterwards you record what happened, in writing or drawing, and reflect on what it means for your life. It can be powerful. If you are in acute distress, ground yourself first and save the exercise for a calmer day.',
  ]),
  A('synchronicity', 'Synchronicity', 'Jung', 'Jung', 'Meaningful coincidence.', [
    'Synchronicity is Jung’s name for a meaningful coincidence: an inner state and an outer event that match in meaning without one causing the other. He developed the idea with the physicist Wolfgang Pauli and published it in 1952.',
    'His best-known example: a patient was describing a dream about a golden scarab when a scarab-like beetle tapped at the window. The coincidence broke through her overly rational attitude and the therapy moved forward.',
    'Esoterica’s Synchronicity log lets you record repeating numbers like 11:11, meaningful encounters and symbols that keep appearing. Over time, the patterns can say something about what your psyche is working on.',
  ]),
  A('jung-and-astrology', 'Jung and astrology', 'Jung', 'Jung', 'Why a psychiatrist studied the stars.', [
    'Jung took astrology seriously as psychology. In a 1911 letter to Freud he mentioned that his evenings were largely taken up with astrology, and he later used horoscopes alongside dreams to understand patients.',
    'He did not think the planets physically cause personality. He saw astrology as humanity’s projected psychology: the zodiac as a map of archetypal images, and its meaningful hits as instances of synchronicity.',
    'In his essay on synchronicity he described an experiment with the horoscopes of married couples. Some batches of data looked remarkably like the tradition predicted, but the overall results were not conclusive, and Jung treated the experiment itself as an example of how meaning can arrange itself around our expectations.',
    'That is the spirit in which Esoterica’s Jung uses your signs and numbers: as symbols to think with, never as fate.',
  ]),
  // ── Mind & Scripture ───────────────────────────────────────────────────────
  A('neville-goddard', 'Who Neville Goddard was', 'Mind & Scripture', 'Tradition', 'The Barbados-born teacher behind the imagination practices.', [
    'Neville Goddard was born on 19 February 1905 in Saint Michael, Barbados, and as a young man moved to New York, where he first worked in the theater. He became one of the best-known teachers of what is often called New Thought, lecturing in New York and later in Los Angeles until his death on 1 October 1972.',
    'His first book, At Your Command, appeared in 1939, and Feeling Is the Secret followed in 1944. Over the following decades he published more than ten short books and gave many lectures, a good number of which survive as recordings and transcripts.',
    'By his own account, his way of reading scripture came largely from a teacher he called Abdullah, who taught him to read the Bible as a psychological drama. Little can be verified about Abdullah beyond Neville’s own description.',
    'Esoterica presents Neville’s ideas in its own words. His practices are offered as inner work for reflection and focus, alongside Jung’s psychology, never as guarantees about the outside world.',
  ]),
  A('imagination-creates-reality', 'Imagination creates reality', 'Mind & Scripture', 'Tradition', 'Neville’s central idea, and how to work with it.', [
    'Neville’s central teaching was that imagination is not idle fantasy but the creative power in a person. What you persistently imagine, and accept as true, tends to shape how you act, what you notice and how your life unfolds.',
    'He did not mean wishful daydreaming. The imaginative act he described is deliberate: you decide on an outcome, picture a small scene that would follow if it were already true, and dwell in it until it feels natural.',
    'He also taught the reverse: the anxious scenes we rehearse without noticing work on us in the same way. Much of his practice is simply about noticing what you are already imagining, and choosing again.',
    'Esoterica’s guide modeled on Neville teaches these practices as inner work. Whatever you believe about how far they reach, they are a way to get clear on what you want and to meet the day from a steadier state.',
  ]),
  A('assumption-and-feeling', 'Assumption and feeling', 'Mind & Scripture', 'Tradition', 'Why Neville put feeling at the center of everything.', [
    'Neville’s best-known instruction is to assume the feeling of the wish fulfilled: to stop hoping for something and instead feel, now, as you would if it were already yours.',
    'The emphasis on feeling matters. An idea you merely think about is weak; one you feel as real starts to organize your attention and behavior. He put it in the title of his 1944 book, Feeling Is the Secret.',
    'Assumption also means thinking from the end rather than toward it. Instead of asking how something could possibly happen, you ask how you would think and act if it already had.',
    'Assumption is easy to misuse. It is not denial of hard facts or of real feelings, and it never means blaming yourself or anyone else for misfortune. Use it to choose your inner stance, and then act in the world as well.',
  ]),
  A('i-am', 'I AM', 'Mind & Scripture', 'Tradition', 'The divine name in Exodus 3:14, read as awareness.', [
    'In Exodus 3:14 the voice from the burning bush gives its name as “I AM THAT I AM”. Many mystics have read this as a statement about being itself rather than the name of a distant deity.',
    'Neville took it personally and practically. Your own sense of “I am”, the awareness that is present before any description, was for him the creative power the Bible is speaking about.',
    'In practice this means noticing what you attach to “I am” through the day (“I am tired”, “I am never lucky”, “I am ready”) and choosing those statements more deliberately, with feeling.',
    'The “I AM” practice in Esoterica takes a minute of noticing and choosing. It works best alongside honest acknowledgment of how you actually feel, not as a way to talk yourself out of it.',
  ]),
  A('sats-living-in-the-end', 'The scene before sleep, and living in the end', 'Mind & Scripture', 'Tradition', 'Neville’s two main techniques for taking on an assumption.', [
    'Neville noticed that the drowsy state just before sleep, which he called a state akin to sleep, is when an imagined scene sinks in most easily: attention is relaxed and the critical mind is quieter.',
    'His technique was to choose one short scene that would naturally follow the fulfillment of your wish, such as a friend congratulating you, and to replay it in the first person, as if you were there, until it felt real. Then you fall asleep in that feeling.',
    'Living in the end carries the same idea into the day. You write and speak from the fulfilled state, notice how that version of you would act, and take one small action that fits.',
    'Both practices are in Esoterica’s Imagination section, with step-by-step guidance and a journal. If either stirs up anxiety, stop and ground yourself; the practices should feel calming, never compulsive.',
  ]),
  A('revision', 'Revision', 'Mind & Scripture', 'Tradition', 'Rewriting the day in imagination before sleep.', [
    'Revision was Neville’s nightly practice: review the day, pick a moment you wish had gone differently, and replay it in imagination the way you would have liked it to go.',
    'He saw it as a way to stop carrying the same reactions forward. The revised scene becomes the version you return to, and your next meeting with that person or situation starts from a different inner place.',
    'Revision does not change what happened and is no way to deny real harm. Psychologically it resembles methods that reshape the emotional charge of a memory, such as the imagery rehearsal therapists use for recurring nightmares.',
    'In Esoterica, revision is offered each evening in the Imagination section, with space to write down what shifted.',
  ]),
  A('mystical-scripture', 'Reading scripture mystically', 'Mind & Scripture', 'Tradition', 'The inward reading of the Bible that Neville drew on, and its long history.', [
    'Alongside literal and historical readings, Christian tradition has always had an inward, mystical way of reading scripture. Medieval writers spoke of several senses of a text, including the allegorical and the spiritual.',
    'The German mystic Meister Eckhart preached that God is born in the depth of the soul, and the Gnostic texts found at Nag Hammadi in 1945 put great weight on inner knowledge. Jung studied both closely and found in them pictures of the process he called individuation.',
    'Neville stood in this inward tradition. He read the people and events of the Bible as states of consciousness: the promised land as a fulfilled desire, faith as the substance of things hoped for, the kingdom of God as within.',
    'These are esoteric readings. Most churches read the same passages differently, and Esoterica presents the mystical reading as one lens among many, quoting the public-domain King James Version.',
  ]),
  A('jung-and-neville', 'Jung and Neville: two ways of imagining', 'Mind & Scripture', 'Jung', 'Active imagination and the imaginal act, side by side.', [
    'Jung and Neville were near contemporaries who both put imagination at the center of inner life, but they used it very differently. As far as is known, they never met or wrote about each other.',
    'Jung’s active imagination lets an image from the unconscious come alive and speak while you keep your own conscious position. The point is to listen and learn what the psyche is trying to show you, not to steer the image toward a goal.',
    'Neville’s imaginal act is directed: you choose the scene and the outcome and dwell in it with feeling. His concern was changing your state, and through it your life.',
    'The two can complement each other. Active imagination helps you find out what you really want and what stands in the way; Neville’s practices help you commit to a chosen direction. Esoterica offers both, with Jung and Neville as separate guides.',
  ]),
  A('imagination-research', 'What research says about imagination', 'Mind & Scripture', 'Research says', 'What studies support, what they don’t, and how to use the practices well.', [
    'Mental rehearsal has real support. Athletes, musicians and surgeons who practice in imagination often improve more than those who do not practice at all, and therapists use imagery, for example to reduce recurring nightmares.',
    'Expectations matter too. Studies of placebo and expectancy effects show that what people anticipate can change how they feel and perform, and simple planning techniques such as “if–then” plans make follow-through more likely.',
    'There is no good evidence that thoughts or feelings directly change outside events, other people’s choices or physical outcomes at a distance. Some research even suggests that fantasizing about a positive outcome without planning for obstacles can lower effort.',
    'So Esoterica treats manifestation practices as reflection and focus: get clear on what you want, imagine it vividly, then pair it with concrete action. No practice here is a reason to skip medical care, ignore real risks, or blame anyone for their circumstances.',
  ]),
];

export const articleBySlug = (slug: string): LearnArticle | undefined => LEARN_ARTICLES.find((a) => a.slug === slug);
