#!/bin/sh
# Fills the back-end data directory from the cwm-test-data git repo.
#
# Runs as a one-shot compose service before the back-end starts, on every
# deploy: the first run clones, later runs pull, so redeploying is how new
# data goes live. Only the datasets named in DATASETS, plus the directories
# their symlinks point at, are checked out. The clone is shallow, blob-less
# and sparse so a multi-gigabyte repo costs one dataset's worth of disk.
#
# Environment:
#   DATA_DIR           where to clone, the back-end's SERVER_DATA_ROOT (default /data)
#   DATASETS           space separated dataset ids, e.g. "cwm-latest powys-eng"
#                      empty: copy the bundled test datasets instead (local dev, tests)
#   DATA_REPO_URL      git URL, with a token for a private repo, e.g.
#                      https://x-access-token:<token>@github.com/DigitalCommons/cwm-test-data.git
#   DATA_REPO_REF      branch to track (default master)
#   TEST_DATASETS_DIR  bundled test datasets (default /test-datasets)
set -eu

: "${DATA_DIR:=/data}"
: "${DATASETS:=}"
: "${DATA_REPO_REF:=master}"
: "${TEST_DATASETS_DIR:=/test-datasets}"

if [ -z "$DATASETS" ]; then
  echo "DATASETS is empty, installing the test datasets from $TEST_DATASETS_DIR"
  mkdir -p "$DATA_DIR/datasets"
  cp -R "$TEST_DATASETS_DIR/." "$DATA_DIR/datasets/"
  exit 0
fi

: "${DATA_REPO_URL:?set DATA_REPO_URL to the cwm-test-data git URL}"

if [ -d "$DATA_DIR/.git" ]; then
  echo "Updating $DATA_DIR to $DATA_REPO_REF"
  # The URL carries the access token, which may have been rotated
  git -C "$DATA_DIR" remote set-url origin "$DATA_REPO_URL"
  git -C "$DATA_DIR" fetch --depth=1 origin "$DATA_REPO_REF"
  git -C "$DATA_DIR" reset -q --hard FETCH_HEAD
else
  echo "Cloning $DATA_REPO_REF into $DATA_DIR"
  git clone --depth=1 --filter=blob:none --sparse --branch "$DATA_REPO_REF" \
    "$DATA_REPO_URL" "$DATA_DIR"
fi

# Work out what to check out. A symlink such as cwm-latest becomes the
# directory it points at; the link itself is checked out too because cone
# mode keeps the files directly inside datasets/. Setting the list replaces
# it, so datasets no longer named are removed.
paths=""
for id in $DATASETS; do
  mode=$(git -C "$DATA_DIR" ls-tree HEAD "datasets/$id" | cut -d' ' -f1)
  case "$mode" in
    120000) paths="$paths datasets/$(git -C "$DATA_DIR" cat-file -p "HEAD:datasets/$id")" ;;
    040000) paths="$paths datasets/$id" ;;
    *) echo "No dataset called $id in $DATA_REPO_URL ($DATA_REPO_REF)" >&2; exit 1 ;;
  esac
done
git -C "$DATA_DIR" sparse-checkout set $paths

# Cone mode also checks out the other symlinks in datasets/ but not their
# targets. Remove the dangling ones so the back-end does not try to load them.
for link in "$DATA_DIR"/datasets/*; do
  if [ -L "$link" ] && [ ! -e "$link" ]; then
    rm "$link"
  fi
done

echo "Datasets in $DATA_DIR/datasets:"
ls -l "$DATA_DIR/datasets"
