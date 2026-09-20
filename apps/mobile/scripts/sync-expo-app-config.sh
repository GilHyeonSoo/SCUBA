#!/usr/bin/env bash
# Ensures EXConstants.bundle contains app.config (required by expo-linking).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONSTANTS_DIR="$(node --print "require('path').dirname(require.resolve('expo-constants/package.json'))")"
WITH_NODE="$CONSTANTS_DIR/scripts/with-node.sh"
GET_CONFIG="$CONSTANTS_DIR/scripts/getAppConfig.js"

sync_bundle() {
  local bundle_dir="$1"
  if [[ -z "$bundle_dir" || ! -d "$bundle_dir" ]]; then
    return 1
  fi

  "$WITH_NODE" "$GET_CONFIG" "$ROOT" "$bundle_dir"
}

# Prefer the app bundle currently installed in DerivedData.
APP_BUNDLE="$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*/Debug-iphonesimulator/SCUBA.app/EXConstants.bundle" -type d 2>/dev/null | head -1 || true)"

if [[ -n "$APP_BUNDLE" ]]; then
  sync_bundle "$APP_BUNDLE"
  echo "Synced app.config -> $APP_BUNDLE"
  exit 0
fi

POD_BUNDLE="$(find "$ROOT/ios" -path "*/EXConstants.bundle" -type d 2>/dev/null | head -1 || true)"
if [[ -n "$POD_BUNDLE" ]]; then
  sync_bundle "$POD_BUNDLE"
  echo "Synced app.config -> $POD_BUNDLE"
  exit 0
fi

echo "No EXConstants.bundle found; run ios build first." >&2
exit 1
