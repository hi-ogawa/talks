#!/bin/bash
set -eu -o pipefail

rm -rf dist
mkdir -p dist
for dir in $(ls -d */ | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}/'); do
  cd "$dir"
  pnpm i
  pnpm build --base="/${dir%/}/"
  cp -rf dist "../dist/${dir%/}"
  cd -
done
