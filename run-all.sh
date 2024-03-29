#!/bin/bash

# Convenience script for running a command in all 3 child projects.
#
# Example:
#
#     ./run-all.sh 'npm i --save-dev eslint'

# Unofficial bash "strict mode"
# See: http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

for dir in "soos-client" "soos-gamelogic" "soos-server"; do
    echo
    echo "Running '$1' in $dir ..."

    cd $dir
    bash -c "$1"
    cd ..
done
