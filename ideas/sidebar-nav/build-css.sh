#!/usr/bin/env bash
# Recompiles sidebar-nav.css – the module on its own, for demo.html – from _sidebar-nav.scss.
# Uses the sass from Nuvio's own node_modules; run `npm install` in the package root first.
set -euo pipefail
cd "$(dirname "$0")"

sass="../../node_modules/.bin/sass"
if [ ! -x "$sass" ]; then
    echo "sass not found at $sass – run 'npm install' in $(cd ../.. && pwd) first" >&2
    exit 1
fi

"$sass" --no-source-map _sidebar-nav.scss sidebar-nav.css
echo "wrote $(pwd)/sidebar-nav.css"
