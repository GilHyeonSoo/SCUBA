const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: '레귤레이터', keywords: ['regulator', 'octopus', '레귤레이터'] },
  { category: 'BCD', keywords: ['bcd', 'buoyancy', 'jacket', 'wing'] },
  { category: '다이빙 컴퓨터', keywords: ['computer', 'dive computer', '컴퓨터', 'shearwater', 'suunto', 'garmin'] },
  { category: '웻슈트', keywords: ['wetsuit', 'drysuit', '웻슈트', '드라이슈트'] },
  { category: '마스크', keywords: ['mask', 'goggle', '마스크'] },
  { category: '핀', keywords: ['fin', 'monofin', 'bi-fin', '핀'] },
  { category: '스노클', keywords: ['snorkel', '스노클'] },
  { category: '탱크', keywords: ['tank', 'cylinder', '탱크'] },
  { category: 'SMB', keywords: ['smb', 'surface marker', 'buoy'] },
  { category: '릴', keywords: ['reel', 'spool', '릴'] },
  { category: '다이브 라이트', keywords: ['light', 'torch', '라이트'] },
  { category: '웨이트', keywords: ['weight', 'belt', '웨이트'] },
  { category: '랜야드', keywords: ['lanyard', '랜야드'] },
];

export function inferGearCategory(title: string): string {
  const haystack = title.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return rule.category;
    }
  }

  return '기타 장비';
}
