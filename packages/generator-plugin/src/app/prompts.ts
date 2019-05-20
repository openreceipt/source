import Generator from 'yeoman-generator';

import filterAndTrim from '../lib/filterAndTrim';

const prompts: Generator.Questions = [
  {
    filter: filterAndTrim,
    message: 'Retailer name',
    name: 'retailerName',
    type: 'input',
    // validate: validateRepoSlug,
  },
  {
    filter: filterAndTrim,
    message: 'Retailer country (leave blank for global stores)',
    name: 'retailerCountry',
    type: 'input',
    // validate: validateRepoSlug,
  },
  {
    filter: filterAndTrim,
    message: 'Retailer email (leave blank if not currently available)',
    name: 'retailerEmail',
    type: 'input',
    // validate: validateRepoSlug,
  },
  // {
  //   choices: ['yes', 'no'],
  //   default: 'yes',
  //   message: 'Use sample EML file to generate parser?',
  //   name: 'format',
  //   type: 'list',
  // },
  // {
  //   filter: filterAndTrim,
  //   message: 'Sample EML file to use',
  //   name: 'emlFilePath',
  //   type: 'input',
  //   validate: validateRepoSlug,
  // },
];

export default prompts;
