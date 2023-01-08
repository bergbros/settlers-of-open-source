#!/bin/bash

for dir in "soos-client" "soos-gamelogic" "soos-server"; do
    echo
    echo "Linting $dir ..."

    cd $dir
    npm run lint
    cd ..
done