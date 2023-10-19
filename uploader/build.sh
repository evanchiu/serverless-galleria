#!/bin/bash

rm -rf build
mkdir -p build

cp -r src public package.json package-lock.json build
pushd build
npm ci --prod
zip -r ../package.zip .
popd