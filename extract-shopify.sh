#!/bin/bash
set -euo pipefail

exec node "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts/extract-templates.js"
