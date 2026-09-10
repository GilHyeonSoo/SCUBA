import { runPlacePipeline } from '../src/pipeline/merge.js';

const { places, report, outputPaths } = runPlacePipeline();

console.log('Place pipeline complete.');
console.log(`- Output: ${outputPaths.places}`);
console.log(`- Report: ${outputPaths.report}`);
console.log(`- Total places: ${places.length}`);
console.log(
  `  shops=${report.afterDedup.shop}, pools=${report.afterDedup.pool}, sites=${report.afterDedup.site}`,
);
console.log(
  `  verified=${report.verification.verified}, partial=${report.verification.partial}, unverified=${report.verification.unverified}`,
);
