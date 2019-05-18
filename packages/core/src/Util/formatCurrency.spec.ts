import formatCurrency from './formatCurrency';

describe('formatCurrency', () => {
  it('handles extraneous whitespace', () => {
    const result = formatCurrency('GBP', '          £  9.99');

    expect(result).toEqual(999);
  });

  it('handles negative values correctly', () => {
    const result = formatCurrency('GBP', '-£9.99');

    expect(result).toEqual(-999);
  });

  it('formats GBP currency values correctly', () => {
    const result = formatCurrency('GBP', '£10.00');

    expect(result).toEqual(1000);
  });

  it('formats USD currency values correctly', () => {
    const result = formatCurrency('USD', '$10.99');

    expect(result).toEqual(1099);
  });
});
