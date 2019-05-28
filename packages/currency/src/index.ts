import accounting from 'accounting';
import currencyFormatter, { Currency } from 'currency-formatter';

/**
 * Converts a string containing a price value with symbol to an integer
 * @param {string} currencyCode
 * @param {string} price
 * @returns {number}
 */
export const getAmountFromPriceString = (
  currencyCode: string,
  price: string,
) => {
  const currencyInformation = currencyFormatter.findCurrency(currencyCode);

  const formattedValue = price
    .replace(currencyInformation.decimalSeparator, '')
    .replace(currencyInformation.symbol, '');

  return parseInt(formattedValue, 10);
};

/**
 * Retrieves currency information for a given `currencyCode`
 * @type {(currencyCode: string) => Currency}
 */
export const getCurrencyInformation = currencyFormatter.findCurrency;

/**
 * Formats a number into a string containing a price value with symbol
 * @type {(value: number, options: {code?: string; locale?: string; symbol?: string; decimal?: string; thousand?: string; precision?: number; format?: string | {pos: string; neg: string; zero: string}}) => string}
 */
export const format = currencyFormatter.format;

/**
 * Formats a string containing a price value with symbol into a number. Does
 * the opposite of `Currency#format()`
 * @type {(value: number, options: {code?: string; locale?: string; symbol?: string; decimal?: string; thousand?: string; precision?: number; format?: string | {pos: string; neg: string; zero: string}}) => string}
 */
export const unformat = currencyFormatter.unformat;

export const currencies: Currency[] = currencyFormatter.currencies;

/**
 * Rounds a given `number` to the required `precision`.
 * @type {(number: number, precision?: number) => string}
 */
export const toFixed = accounting.toFixed;
