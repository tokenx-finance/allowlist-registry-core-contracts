const fs = require('fs');

function getCoverageStatus(coverage) {
  const coveredPercentage = (coverage.lines.covered / coverage.lines.total) * 100;

  if (coveredPercentage >= 80) {
    return '![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)';
  } else if (coveredPercentage >= 60) {
    return '![coverage](https://img.shields.io/badge/coverage-80%25-yellow)';
  } else {
    return '![coverage](https://img.shields.io/badge/coverage-60%25-red)';
  }
}

function generateMarkdown(coverageData) {
  let markdown = `| File                               | Lines Covered | Total Lines | Functions Covered | Total Functions | Branches Covered | Total Branches |
|------------------------------------|---------------|-------------|-------------------|-----------------|------------------|----------------|\n`;

  for (const [filePath, coverage] of Object.entries(coverageData)) {
    const coverageStatus = getCoverageStatus(coverage);
    const lineCoverage = `${coverage.lines.covered} / ${coverage.lines.total}`;
    const functionCoverage = `${coverage.functions.covered} / ${coverage.functions.total}`;
    const branchCoverage = `${coverage.branches.covered} / ${coverage.branches.total}`;

    markdown += `| ${filePath.padEnd(35)} | ${lineCoverage.padEnd(14)} | ${functionCoverage.padEnd(12)} | ${branchCoverage.padEnd(17)} |\n`;
  }

  return markdown;
}

fs.readFile('./coverage.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const coverageData = JSON.parse(data);
  const markdown = generateMarkdown(coverageData);
  console.log(markdown);
});
