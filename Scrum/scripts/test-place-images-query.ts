const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://qynwqpbvxhtelqqeavwh.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const headers = { apikey: key, Authorization: `Bearer ${key}` };

const PLACE_LIST_SELECT =
  'id,name,place_type,address_line,region,city,latitude,longitude,short_description,place_images(id,url,source,caption,is_primary,sort_order)';

async function main() {
  const rows: Array<{ place_images?: Array<{ url: string }> }> = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const res = await fetch(
      `${url}/rest/v1/places?select=${encodeURIComponent(PLACE_LIST_SELECT)}&is_published=eq.true&status=neq.closed&order=name.asc&offset=${offset}&limit=${pageSize}`,
      { headers },
    );
    const data = await res.json();
    if (!res.ok) {
      console.error('fetch failed', data);
      process.exit(1);
    }
    if (!Array.isArray(data) || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  const withImages = rows.filter((row) => row.place_images && row.place_images.length > 0);
  console.log(`places=${rows.length} withImages=${withImages.length}`);
}

main();
