#!/bin/bash

set -euo pipefail

usage() {
  command=$(basename "$0")
  echo ""
  echo -e "SYNOPSIS"
  echo -e "    $command --cafile=/absolute/path/to/company-root-ca.pem [--scope=all|repo|components|legacy-elements]"
  echo ""
  echo -e "DESCRIPTION"
  echo "  Configure npm to trust the provided CA certificate and re-enable strict SSL."
  echo ""
  echo -e "OPTIONS"
  echo -e "  --cafile=path          absolute path to the trusted CA PEM file"
  echo -e "  --scope=scope          one of all, repo, components, legacy-elements (default: all)"
  echo -e "  --help                 display this help"
  echo ""
  exit 1
}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)
SCOPE=all

for i in "$@"; do
  case $i in
    --cafile=*)
      CAFILE="${i#*=}"
      shift
      ;;
    --scope=*)
      SCOPE="${i#*=}"
      shift
      ;;
    --help)
      usage
      ;;
  esac
done

if [ -z "${CAFILE:-}" ]; then
  echo "ERROR: --cafile is required"
  usage
fi

if [ ! -f "$CAFILE" ]; then
  echo "ERROR: CA file '$CAFILE' does not exist"
  exit 1
fi

CAFILE=$(cd "$(dirname "$CAFILE")" && pwd)/$(basename "$CAFILE")

configure_scope() {
  target_dir="$1"
  (
    cd "$target_dir"
    npm config set cafile "$CAFILE" --location=project
    npm config set strict-ssl true --location=project
  )
  echo "Configured npm CA in $target_dir"
}

case "$SCOPE" in
  all)
    configure_scope "$REPO_DIR"
    configure_scope "$REPO_DIR/components"
    configure_scope "$REPO_DIR/legacy-elements"
    ;;
  repo)
    configure_scope "$REPO_DIR"
    ;;
  components)
    configure_scope "$REPO_DIR/components"
    ;;
  legacy-elements)
    configure_scope "$REPO_DIR/legacy-elements"
    ;;
  *)
    echo "ERROR: unsupported scope '$SCOPE'"
    usage
    ;;
esac