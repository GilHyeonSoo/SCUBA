import { collectKakaoLocal } from '../src/apis/kakao-local.js';
import { config } from '../src/config.js';
import { buildRegionalQueries, allCategories } from '../src/queries.js';
import { saveCollectionFile } from '../src/save-json.js';

async function main() {
  console.log('Collecting Kakao Local Search data for Korea...');

  for (const category of allCategories) {
    const queries = buildRegionalQueries(category);
    const payload = await collectKakaoLocal(queries, category);
    const filePath = saveCollectionFile('kakao-local', category, payload, config.outputDir);

    console.log(`[kakao-local] ${category}: ${payload.items.length} items -> ${filePath}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
