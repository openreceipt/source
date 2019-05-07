import { extract, roundToDecimal } from './helpers';

describe('roundToDecimal', () => {
  it('rounds decimal numbers to the required precision', () => {
    const result = roundToDecimal(2.009, 2);

    expect(result).toEqual(2.01);
  });
});

describe('extract', () => {
  const START = '<p>';
  const END = '</p>';
  const TEXT = `${START}Some text${END}`;

  it('extracts text from between two substrings', () => {
    const result = extract(TEXT, START, END);

    expect(result).toEqual('Some text');
  });
});
