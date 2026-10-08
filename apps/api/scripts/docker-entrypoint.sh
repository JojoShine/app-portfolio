#!/bin/sh
set -eu
if [ "${RUN_INITIALIZATION:-true}" = "true" ]; then
  node scripts/initialize.js
fi
exec node src/index.js
