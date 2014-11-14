#!/bin/bash

TARGET="./tmp/$1"

git clone $2 $TARGET
cd $TARGET
cp ~/.ssh/id_rsa ./
docker build -t $3 .
docker push
rm -f ./id_rsa

