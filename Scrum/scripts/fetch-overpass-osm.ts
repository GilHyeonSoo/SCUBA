import { collectOverpassByCategory } from '../src/apis/overpass-osm.js';
import { config } from '../src/config.js';
import { allCategories } from '../src/queries.js';
import { saveCollectionFile } from '../src/save-json.js';

async function main() {
  console.log('Collecting OpenStreetMap Overpass data for Korea...');

  for (const category of allCategories) {
    const payload = await collectOverpassByCategory(category);
    const filePath = saveCollectionFile('overpass-osm', category, payload, config.outputDir);

    console.log(`[overpass-osm] ${category}: ${payload.items.length} items -> ${filePath}`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
