#!/bin/bash

rm -rf build
mkdir -p build

cp -r src package.json package-lock.json build
pushd build
npm ci --prod
zip -rq ../package.zip .
popd