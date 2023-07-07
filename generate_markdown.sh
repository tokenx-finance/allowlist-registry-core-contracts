#!/bin/bash

get_coverage_status() {
  local coverage=$1
  local covered_percentage=$((coverage.lines.covered * 100 / coverage.lines.total))

  if ((covered_percentage >= 80)); then
    echo "![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)"
  elif ((covered_percentage >= 60)); then
    echo "![coverage](https://img.shields.io/badge/coverage-80%25-yellow)"
  else
    echo "![coverage](https://img.shields.io/badge/coverage-60%25-red)"
  fi
}

generate_markdown() {
  local coverage_file=$1
  local markdown="| File                               | Lines Covered | Total Lines | Functions Covered | Total Functions | Branches Covered | Total Branches |
|------------------------------------|---------------|-------------|-------------------|-----------------|------------------|----------------|"

  local coverage_data=$(cat $coverage_file)
  local file_entries=$(echo $coverage_data | jq -r 'to_entries[]')

  while IFS= read -r entry; do
    local file_path=$(echo $entry | jq -r '.key')
    local coverage=$(echo $entry | jq '.value')
    local coverage_status=$(get_coverage_status $coverage)
    local line_coverage=$(echo $coverage | jq -r '.lines.covered' )"/"$(echo $coverage | jq -r '.lines.total')
    local function_coverage=$(echo $coverage | jq -r '.functions.covered' )"/"$(echo $coverage | jq -r '.functions.total')
    local branch_coverage=$(echo $coverage | jq -r '.branches.covered' )"/"$(echo $coverage | jq -r '.branches.total')

    markdown+="\n| ${file_path} | ${line_coverage} | ${function_coverage} | ${branch_coverage} |"
  done <<< "$file_entries"

  echo "$markdown"
}

coverage_file="coverage.json"
markdown=$(generate_markdown "$coverage_file")
echo "$markdown" > coverage.md
