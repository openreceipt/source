#!/usr/bin/env bash

for file in plugin; do
  cp -R "src/${file}/templates" "generators/${file}";
done;
unset file;
