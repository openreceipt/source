import currencyFormatter from 'currency-formatter';

export default (currencyCode: string, price: string) => {
  const currencyInformation = currencyFormatter.findCurrency(currencyCode);
  const value = currencyFormatter.unformat(price, {
    code: currencyCode,
  });
  return parseInt(
    `${value}`.replace(currencyInformation.decimalSeparator, ''),
    10,
  );
};
