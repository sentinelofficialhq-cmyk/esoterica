// lunar-javascript ships no type declarations; only the calls Esoterica uses are typed here.
declare module 'lunar-javascript' {
  export class Lunar {
    getYearInGanZhi(): string;
    getDayInGanZhi(): string;
    getFestivals(): string[];
  }
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    getLunar(): Lunar;
  }
}
