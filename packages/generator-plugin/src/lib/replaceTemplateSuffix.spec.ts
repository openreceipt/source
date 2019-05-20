import replaceTemplateSuffix from './replaceTemplateSuffix';

describe('#replaceTemplateSuffix', () => {
  it('replaces template prefixes with .', () => {
    expect(replaceTemplateSuffix('_snopes.ts.ejs')).toBe('_snopes.ts');
  });

  it('replaces template prefixes with a provided replacement', () => {
    expect(replaceTemplateSuffix('_snopes.ejs', '.ts')).toBe('_snopes.ts');
  });
});
