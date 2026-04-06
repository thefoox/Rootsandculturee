#!/bin/bash
# Helper script for icon generation — sources OPENAI_API_KEY from .env.local
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export OPENAI_API_KEY=$(grep OPENAI_API_KEY "$SCRIPT_DIR/.env.local" | cut -d= -f2)
python3 ~/.claude/skills/design-lab/generate-image.py "$@"
