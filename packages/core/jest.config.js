module.exports = {
  preset: 'ts-jest',
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/__fixtures__/',
  ],
  // @TODO Uncomment the following lines once test coverage has reached an acceptable threshold
  // 'coverageThreshold': {
  //   'global': {
  //     'branches': 90,
  //     'functions': 95,
  //     'lines': 95,
  //     'statements': 95
  //   }
  // },
  globals: {
    'ts-jest': {
      tsConfig: "tsconfig.test.json",
    },
  },
};
