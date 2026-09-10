import { collectNaverLocal } from '../src/apis/naver-local.js';
import { config } from '../src/config.js';
import { buildRegionalQueries, allCategories } from '../src/queries.js';
import { saveCollectionFile } from '../src/save-json.js';

async function main() {
  console.log('Collecting Naver Local Search data for Korea...');

  for (const category of allCategories) {
    const queries = buildRegionalQueries(category);
    const payload = await collectNaverLocal(queries, category);
    const filePath = saveCollectionFile('naver-local', category, payload, config.outputDir);

    console.log(`[naver-local] ${category}: ${payload.items.length} items -> ${filePath}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
