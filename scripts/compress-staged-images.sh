#!/usr/bin/env bash
# Compress oversized JPEG / PNG images before they're committed.
# Runs from the pre-commit hook. macOS only (uses the built-in `sips`);
# silently skips on any other OS so the commit still succeeds.

set -euo pipefail

MAX_LONG_EDGE=1600   # max dimension in pixels for the long edge
JPEG_QUALITY=80      # JPEG re-encode quality
MIN_KB=400           # files smaller than this are considered already-fine

if ! command -v sips >/dev/null 2>&1; then
  exit 0
fi

# Repo root, so paths are resolvable no matter where git ran the hook from.
cd "$(git rev-parse --show-toplevel)"

# Collect staged image files (added, copied, modified, renamed).
# Plain while-read loop for compatibility with macOS's default bash 3.2.
changed=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  [ -f "$f" ] || continue

  size_kb=$(du -k "$f" | cut -f1)
  if [ "$size_kb" -le "$MIN_KB" ]; then
    continue
  fi

  echo "compress-images: $f (${size_kb} KB) → resizing…"
  case "$f" in
    *.png|*.PNG)
      # PNG is lossless; just resize (and sips re-encodes with default
      # compression, which strips most metadata as a side effect).
      sips -Z "$MAX_LONG_EDGE" "$f" --out "$f" >/dev/null
      ;;
    *)
      sips -Z "$MAX_LONG_EDGE" -s formatOptions "$JPEG_QUALITY" "$f" --out "$f" >/dev/null
      ;;
  esac
  new_kb=$(du -k "$f" | cut -f1)
  echo "                 now ${new_kb} KB"
  git add "$f"
  changed=1
done < <(git diff --cached --name-only --diff-filter=ACMR | grep -Ei '\.(jpe?g|png)$' || true)

if [ "$changed" -eq 1 ]; then
  echo "compress-images: re-staged compressed file(s)."
fi

exit 0
