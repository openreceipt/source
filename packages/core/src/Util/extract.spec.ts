import extract from './extract';

describe('extract', () => {
  const START = '<p>';
  const END = '</p>';
  const TEXT = `${START}Some text${END}`;

  it('extracts text from between two substrings', () => {
    const result = extract(TEXT, START, END);

    expect(result).toEqual('Some text');
  });
});
