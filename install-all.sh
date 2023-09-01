#!/bin/bash

# Unofficial bash "strict mode"
# See: http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

for dir in "soos-client" "soos-gamelogic" "soos-server"; do
    echo
    echo "Running npm install in $dir ..."

    cd $dir
    npm install
    cd ..
done
