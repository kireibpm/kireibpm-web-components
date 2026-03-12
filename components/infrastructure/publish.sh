#!/bin/bash

set -euo pipefail

usage() {
  command=$(basename "$0")
  echo ""
  echo -e "SYNOPSIS"
  echo -e "    $command --component=<component>"
  echo ""
  echo -e "DESCRIPTION"
  echo "  Publish the specified component to npm registry"
  echo ""
  echo -e "ARGUMENTS"
  echo -e "  --component=component      component to publish"
  echo ""
  echo -e "  --help                   display this help"
  echo ""
  exit 1
}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
BASE_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

for i in "$@"; do
  case $i in
    --component=*)
      COMPONENT="${i#*=}"
      shift
      ;;
    --help)
      usage
      ;;
  esac
done

if [ -z "$COMPONENT" ]; then
  echo "ERROR: --component is required"
  usage
fi

COMPONENT_PATH=$(find "$BASE_DIR/packages" -type d -name "$COMPONENT" | head -n 1)

if [ -z "$COMPONENT_PATH" ]; then
  echo "ERROR: component '$COMPONENT' not found under $BASE_DIR/packages"
  exit 1
fi

cd "$COMPONENT_PATH" || exit

PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_MODULE=$(node -p "require('./package.json').module || ''")
NPM_USER=$(npm whoami)

if [ "$NPM_USER" ]; then
  if [ -n "$PACKAGE_MODULE" ] && [ ! -f "$PACKAGE_MODULE" ]; then
    npm install
    npm run bundle --if-present
  fi

  if [ -n "$PACKAGE_MODULE" ] && [ ! -f "$PACKAGE_MODULE" ]; then
    echo "ERROR: expected module artifact '$PACKAGE_MODULE' is missing for $PACKAGE_NAME"
    exit 1
  fi

  npm pack --dry-run >/dev/null
  npm publish --ignore-scripts --access public
  echo "Published ${PACKAGE_NAME}@${PACKAGE_VERSION} on npm registry as ${NPM_USER}"
fi
