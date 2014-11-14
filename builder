#!/bin/bash

TARGET="./tmp/$1"

git clone $2 $TARGET
cd $TARGET
docker build -t $3 .
docker push

