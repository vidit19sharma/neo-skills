#!/usr/bin/env bash
# neo-skills installer — copies skills into your agent's skills directory.
# Usage:
#   ./install.sh              # install for every detected agent
#   ./install.sh --target opencode|claude
#   ./install.sh --force      # overwrite existing skill dirs
#   ./install.sh --uninstall  # remove installed copies
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SRC="$REPO_DIR/skills"

OPENCODE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/skills"
CLAUDE_DIR="$HOME/.claude/skills"

FORCE=0
UNINSTALL=0
TARGET="all"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    --uninstall) UNINSTALL=1 ;;
    --target) TARGET="${2:?--target requires a value}"; shift ;;
    -h|--help) grep '^#[^!]' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

dest_dirs() {
  case "$TARGET" in
    opencode) echo "$OPENCODE_DIR" ;;
    claude)   echo "$CLAUDE_DIR" ;;
    all)
      # Only install where the parent tool config exists
      [[ -d "$(dirname "$OPENCODE_DIR")" ]] && echo "$OPENCODE_DIR"
      [[ -d "$(dirname "$CLAUDE_DIR")" ]] && echo "$CLAUDE_DIR"
      ;;
    *) echo "Unknown target: $TARGET (use opencode|claude)" >&2; exit 1 ;;
  esac
}

DESTS="$(dest_dirs)"
if [[ -z "$DESTS" ]]; then
  echo "No agent config directories detected (looked for opencode and Claude Code)." >&2
  echo "Use --target opencode|claude to force one." >&2
  exit 1
fi

for dest in $DESTS; do
  for skill_path in "$SKILLS_SRC"/*/; do
    skill_name="$(basename "$skill_path")"
    target_path="$dest/$skill_name"
    if [[ "$UNINSTALL" -eq 1 ]]; then
      if [[ -d "$target_path" ]]; then
        rm -rf "$target_path"
        echo "Removed $target_path"
      fi
      continue
    fi
    if [[ -d "$target_path" && "$FORCE" -ne 1 ]]; then
      echo "Skipping $target_path (exists — use --force to overwrite)"
      continue
    fi
    mkdir -p "$dest"
    rm -rf "$target_path"
    cp -R "$skill_path" "$target_path"
    echo "Installed $skill_name -> $target_path"
  done
done

[[ "$UNINSTALL" -eq 1 ]] && echo "Uninstall complete." || echo "Done. Restart your agent session to pick up new skills."
