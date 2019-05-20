import camelCase from 'lodash.camelcase';
import kebabCase from 'lodash.kebabcase';
import Generator from 'yeoman-generator';

import { Answers } from '../app';

// parserSince

// retailerCountry
// retailerName

// packageName

// retailerEmail
// retailerNameCamelCase

export default (answers: Generator.Answers & Answers) => {
  const [ firstLetter, ...otherLetters ] = camelCase(answers.retailerName);
  const retailerNameCamelCase = `${firstLetter.toLocaleUpperCase()}${otherLetters.join('')}`;
  const packageName = kebabCase(`${answers.retailerName} ${answers.retailerCountry}`);
  return {
    ...answers,
    packageName,
    retailerNameCamelCase,
  };
}
