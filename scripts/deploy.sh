#!/usr/bin/env bash

echo "==> Deploy information:"
export STAGE=$1
echo "==> STAGE = $STAGE"

# Build types
cd packages/types
yarn build
