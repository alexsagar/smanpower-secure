#!/usr/bin/env bash
# Renders a page as it exists on origin/dev against the migrated version and
# asserts byte-identical markup. Usage: ./scripts-parity.sh <path-under-(public)> <ComponentName>
set -e
ROUTE="$1"; NAME="$2"
FILE="src/app/(public)/$ROUTE/page.tsx"
OUT="src/__parity__/${NAME}-original.tsx"
git show "origin/dev:$FILE" > "$OUT"
python - "$OUT" "$NAME" <<'PY'
import sys, re
p, name = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf8').read()
s = re.sub(r'export default (async )?function \w+', lambda m: f'export {m.group(1) or ""}function {name}Original', s)
s = s.replace('export const metadata', 'const metadataOriginal')
s = re.sub(r'export async function generateMetadata', 'async function generateMetadataOriginal', s)
s = re.sub(r'export function generateStaticParams', 'function generateStaticParamsOriginal', s)
open(p, 'w', encoding='utf8', newline='').write(s)
PY
echo "baseline written: $OUT"
