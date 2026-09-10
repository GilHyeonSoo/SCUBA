import { collectGooglePlaces } from '../src/apis/google-places.js';
import { config } from '../src/config.js';
import { buildRegionalQueries, allCategories } from '../src/queries.js';
import { saveCollectionFile } from '../src/save-json.js';

async function main() {
  console.log('Collecting Google Places data for Korea...');

  for (const category of allCategories) {
    const queries = buildRegionalQueries(category);
    const payload = await collectGooglePlaces(queries, category);
    const filePath = saveCollectionFile('google-places', category, payload, config.outputDir);

    console.log(`[google-places] ${category}: ${payload.items.length} items -> ${filePath}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
