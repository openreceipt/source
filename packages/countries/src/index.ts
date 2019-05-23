import Countries from 'world-countries';

import * as Types from './types';

export type Country = Types.Country;

export const countries: Types.Country[] = Countries;

export const findCountriesByName = (name: string): Country[] => {
  return countries.filter((country) => {
    return [
      country.name.official,
      country.name.common,
      ...country.altSpellings,
    ].includes(name.trim());
  });
};

export const findCountryByName = (name: string): Country | undefined => {
  const [firstResult] = findCountriesByName(name);
  return firstResult;
};
