// declare module 'world-countries';
declare module 'world-countries' {
  export interface Country {
    name: {
      common: string;
      official: string;
      native?: {
        [langCode: string]: {
          common: string;
          official: string;
        };
      };
    };
    tld: string[];
    cca2: string;
    ccn3: string;
    cca3: string;
    cioc: string;
    independent: boolean;
    status: string;
    currency: string[];
    callingCode: string[];
    capital: string[];
    altSpellings: string[];
    region: string;
    subregion: string;
    languages: {
      [langCode: string]: string;
    };
    translations: {
      [langCode: string]: {
        common: string;
        official: string;
      };
    };
    latlng: number[];
    demonym: string;
    landlocked: boolean;
    borders: string[];
    area: number;
    flag: string;
  }

  const countries: Country[];

  export default countries;
}
