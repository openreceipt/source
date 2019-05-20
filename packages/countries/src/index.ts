import Countries from 'world-countries';

import * as Types from './types';

export type Country = any;

export const countries: Types.Country[] = Countries;

export const findCountryByName = (name: string): Country[] => {
  return countries.filter((country) => {
    [country.name, ...country.altSpellings].includes(name);
  });
};
