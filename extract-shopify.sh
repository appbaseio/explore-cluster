#!/bin/bash
set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:-}"

if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required to extract templates."
    echo "Install jq and retry (macOS: brew install jq)."
    exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$ROOT_DIR/templates"

rm -rf "$TEMPLATES_DIR"
mkdir -p "$TEMPLATES_DIR"

jq -c '.[]' "$ROOT_DIR/template-sources.json" | while read -r i; do
    version=$(echo "${i}" | jq -r '.version')
    commit=$(echo "${i}" | jq -r '.commit')
    branch=$(echo "${i}" | jq -r '.branch')
    organization=$(echo "${i}" | jq -r '.organization')
    repository=$(echo "${i}" | jq -r '.repository')
    repositoryType=$(echo "${i}" | jq -r '.repositoryType')

    if [ -n "$version" ] && [ "$version" != "null" ]; then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/refs/tags/$version"
        fileName="$repository@$version"
    elif [ -n "$commit" ] && [ "$commit" != "null" ]; then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/$commit"
        fileName="$repository@$commit"
    elif [ -n "$branch" ] && [ "$branch" != "null" ]; then
        url="https://codeload.github.com/$organization/$repository/legacy.zip/refs/heads/$branch"
        fileName="$repository@$branch"
    else
        url="https://api.github.com/repos/$organization/$repository/zipball/"
        fileName="$repository"
    fi

    if [ "$repositoryType" = "private" ] && [ -z "$GITHUB_TOKEN" ]; then
        echo "Skipping private repository $organization/$repository (missing GITHUB_TOKEN)"
        continue
    fi

    targetDir="$TEMPLATES_DIR/$fileName"
    mkdir -p "$targetDir"
    cd "$targetDir"

    if [ "$repositoryType" = "private" ]; then
        curl -sS \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: token $GITHUB_TOKEN" \
            "$url" > file.zip
    else
        curl -sS "$url" > file.zip
    fi

    unzip -oq file.zip
    rm -f file.zip
done
