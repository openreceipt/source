import accounting from 'accounting';
import currencyFormatter from 'currency-formatter';

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

export const getCurrencyInformation = currencyFormatter.findCurrency;

export const format = currencyFormatter.format;

export const unformat = currencyFormatter.unformat;

export const currencies = currencyFormatter.currencies;

export const toFixed = accounting.toFixed;
