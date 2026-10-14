import { chineseSign, type ChineseSign } from '@/engines/chinese';
import { nameNumbers, type LetterSystem, type NameNumbers } from '@/engines/letterology';
import { attitudeNumber, birthdayNumber, lifePath, luckyNumbers, type Reduced } from '@/engines/numerology';
import { sunSign, type WesternSign } from '@/engines/western';

/** One birthday (and optional name) read through every system. Also used for brands, places and people. */
export type Profile = {
  name: string;
  birthName: string;
  birthDate: string;
  lifePath: Reduced;
  birthday: Reduced;
  attitude: Reduced;
  luckyNumbers: number[];
  western: WesternSign;
  chinese: ChineseSign;
  letters: NameNumbers | null;
};

export function buildProfile(input: {
  name: string;
  birthName?: string;
  birthDate: string;
  letterSystem?: LetterSystem;
}): Profile {
  const birthName = (input.birthName || input.name).trim();
  let letters: NameNumbers | null = null;
  try {
    letters = nameNumbers(birthName, input.letterSystem);
  } catch {
    letters = null;
  }
  return {
    name: input.name.trim(),
    birthName,
    birthDate: input.birthDate,
    lifePath: lifePath(input.birthDate),
    birthday: birthdayNumber(input.birthDate),
    attitude: attitudeNumber(input.birthDate),
    luckyNumbers: luckyNumbers(input.birthDate),
    western: sunSign(input.birthDate),
    chinese: chineseSign(input.birthDate),
    letters,
  };
}
