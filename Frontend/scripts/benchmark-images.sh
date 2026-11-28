#!/usr/bin/env bash
# Builds the standard and the multi-stage image 3 times each (no layer cache)
# and writes build time + final image size to benchmark/image-build.csv.
# Run from the project root (Git Bash / Linux / macOS):  bash scripts/benchmark-images.sh
set -e
mkdir -p benchmark
OUT=benchmark/image-build.csv
echo "variant,run,build_seconds,image_size_mb" > "$OUT"

measure() {
  local variant=$1 file=$2 tag=$3 run=$4
  local start end secs bytes mb
  start=$(date +%s.%N)
  docker build --no-cache -f "$file" -t "$tag" . > /dev/null
  end=$(date +%s.%N)
  secs=$(awk "BEGIN{printf \"%.1f\", $end - $start}")
  bytes=$(docker image inspect "$tag" --format '{{.Size}}')
  mb=$(awk "BEGIN{printf \"%.1f\", $bytes/1024/1024}")
  echo "$variant,$run,$secs,$mb" | tee -a "$OUT"
}

for run in 1 2 3; do
  measure standard    Dockerfile.standard notes-fe:standard "$run"
  measure multi-stage Dockerfile          notes-fe:multi    "$run"
done

echo; echo "Layers of each image (paste into the report):"
docker history notes-fe:standard --format '{{.Size}}\t{{.CreatedBy}}' | head -n 8
echo "---"
docker history notes-fe:multi    --format '{{.Size}}\t{{.CreatedBy}}' | head -n 8
echo; echo "Saved to $OUT"
