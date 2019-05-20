import currencyFormatter from 'currency-formatter';

/**
 * @deprecated Use `Util.Currency.formatCurrency()` instead
 * @param currencyCode
 * @param price
 */
export default (currencyCode: string, price: string) => {
  const currencyInformation = currencyFormatter.findCurrency(currencyCode);

  const formattedValue = price
    .replace(currencyInformation.decimalSeparator, '')
    .replace(currencyInformation.symbol, '');

  return parseInt(formattedValue, 10);
};
