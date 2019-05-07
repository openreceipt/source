#!/usr/bin/env bash

cd packages/dom
yarn build

cd ../mail
yarn build

cd ../core
yarn build

cd ../cli
yarn build

cd ../plugin-console
yarn build

cd ../plugin-mail
yarn build

cd ../plugin-zooplus-uk
yarn build
