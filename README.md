# @openreceipt/source

[![CI Status][icon-ci]][link-ci]
[![Jest][icon-jest]][link-jest]
[![Commitizen][icon-commitizen]][link-commitizen]
[![Semantic Release][icon-semantic-release]][link-semantic-release]
[![Prettier][icon-prettier]][link-prettier]

Parse receipt information from your emails!

## Getting Started

``` bash
git clone https://github.com/openreceipt/source.git
cd source
yarn
cd packages/cli-starter
yarn build
yarn start run <PATH_TO_EML_FILE>
```

## Features

- Plugin-based architecture
- be able to match incoming emails to the right parsers/plugins
- be able to detect when an email has changed format
- format output to match target destination (monzo or other)
- validate the final receipt is in the right format

## Architecture

## Prerequisites

## Built with

This project would not exist without:

- `yargs`
- `cheerio`
- `mailParser`
- `currency-formatter`

[icon-ci]: https://img.shields.io/travis/com/openreceipt/source/master.svg?style=flat-square
[link-ci]: https://travis-ci.com/openreceipt/source

[icon-jest]: https://img.shields.io/badge/tested_with-jest-99424f.svg?longCache=true&style=flat-square
[link-jest]: https://jestjs.io/

[icon-commitizen]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?longCache=true&style=flat-square
[link-commitizen]: http://commitizen.github.io/cz-cli/
[icon-semantic-release]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?longCache=true&style=flat-square
[link-semantic-release]: https://semantic-release.gitbooks.io/semantic-release/
[icon-prettier]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?longCache=true&style=flat-square
[link-prettier]: https://prettier.io/
