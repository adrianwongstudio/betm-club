#!/usr/bin/env bash
# Compress oversized JPEGs before they're committed.
# Runs from the pre-commit hook. macOS only (uses the built-in `sips`);
# silently skips on any other OS so the commit still succeeds.

set -euo pipefail

MAX_LONG_EDGE=1600   # max dimension in pixels for the long edge
QUALITY=80           # JPEG re-encode quality
MIN_KB=400           # files smaller than this are considered already-fine

if ! command -v sips >/dev/null 2>&1; then
  exit 0
fi

# Repo root, so paths are resolvable no matter where git ran the hook from.
cd "$(git rev-parse --show-toplevel)"

# Collect staged .jpg / .jpeg files (added, copied, modified, renamed).
# Using a plain while-read loop for compatibility with macOS's default bash 3.2.
changed=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  [ -f "$f" ] || continue

  size_kb=$(du -k "$f" | cut -f1)
  if [ "$size_kb" -le "$MIN_KB" ]; then
    continue
  fi

  echo "compress-images: $f (${size_kb} KB) → resizing…"
  sips -Z "$MAX_LONG_EDGE" -s formatOptions "$QUALITY" "$f" --out "$f" >/dev/null
  new_kb=$(du -k "$f" | cut -f1)
  echo "                 now ${new_kb} KB"
  git add "$f"
  changed=1
done < <(git diff --cached --name-only --diff-filter=ACMR | grep -Ei '\.(jpe?g)$' || true)

if [ "$changed" -eq 1 ]; then
  echo "compress-images: re-staged compressed file(s)."
fi

exit 0
