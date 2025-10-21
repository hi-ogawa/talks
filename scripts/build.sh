#!/bin/bash
set -eu -o pipefail

rm -rf dist
mkdir -p dist
cd 2025-10-25
pnpm i
pnpm build
cp -rf dist ../dist/2025-10-25
cd -
