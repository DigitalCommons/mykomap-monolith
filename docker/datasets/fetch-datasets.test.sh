#!/bin/sh
# Tests fetch-datasets.sh against a throwaway local git repo shaped like
# cwm-test-data (datasets/<id>/ directories plus <id>-latest symlinks).
#
# Run from anywhere:
#
#     sh docker/datasets/fetch-datasets.test.sh
set -eu

here=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

commit() {
  git -C "$src" add -A
  git -C "$src" -c user.name=test -c user.email=test@example.com commit -q -m "$1"
}

# Fixture data repo. allowFilter lets a file:// remote serve partial clones.
src="$tmp/src"
git init -q -b master "$src"
git -C "$src" config uploadpack.allowFilter true
mkdir -p "$src/datasets/cwm-20260101/items" "$src/datasets/other"
echo '{"id":1}' > "$src/datasets/cwm-20260101/items/1.json"
echo '{}' > "$src/datasets/cwm-20260101/config.json"
echo '{}' > "$src/datasets/other/config.json"
ln -s cwm-20260101 "$src/datasets/cwm-latest"
ln -s other "$src/datasets/other-latest"
commit "first"

run() {
  DATA_DIR="$1" DATA_REPO_URL="file://$src" DATA_REPO_REF=master DATASETS="$2" \
    sh "$here/fetch-datasets.sh" >"$tmp/out.log" 2>&1 || {
      cat "$tmp/out.log"
      fail "fetch-datasets.sh exited non-zero"
    }
}

# 1. The named dataset and its symlink target are checked out, nothing else is
data="$tmp/data"
run "$data" "cwm-latest"
[ -f "$data/datasets/cwm-latest/items/1.json" ] || fail "symlinked dataset not checked out"
[ -d "$data/datasets/cwm-20260101" ] || fail "symlink target not checked out"
[ ! -e "$data/datasets/other" ] || fail "unrequested dataset was checked out"
[ ! -L "$data/datasets/other-latest" ] || fail "dangling symlink to an unrequested dataset was left behind"

# 2. A second run picks up a new commit, follows the moved symlink and drops
#    the dataset the symlink no longer points at
mkdir -p "$src/datasets/cwm-20260201"
echo '{}' > "$src/datasets/cwm-20260201/config.json"
ln -sfn cwm-20260201 "$src/datasets/cwm-latest"
commit "second"
run "$data" "cwm-latest"
[ -f "$data/datasets/cwm-20260201/config.json" ] || fail "update not fetched"
[ ! -e "$data/datasets/cwm-20260101" ] || fail "old symlink target not removed"

# 3. Several datasets can be named
run "$data" "cwm-latest other"
[ -f "$data/datasets/other/config.json" ] || fail "second dataset not checked out"

# 4. With no DATASETS the bundled test datasets are copied in instead
testsets="$tmp/testsets"
mkdir -p "$testsets/dataset-A"
echo '{}' > "$testsets/dataset-A/config.json"
data2="$tmp/data2"
DATA_DIR="$data2" TEST_DATASETS_DIR="$testsets" DATASETS="" \
  sh "$here/fetch-datasets.sh" >"$tmp/out.log" 2>&1 || {
    cat "$tmp/out.log"
    fail "fetch-datasets.sh exited non-zero with no DATASETS"
  }
[ -f "$data2/datasets/dataset-A/config.json" ] || fail "test datasets not copied"

echo "OK: fetch-datasets.sh"
