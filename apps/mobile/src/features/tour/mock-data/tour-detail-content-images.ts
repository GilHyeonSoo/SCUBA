const CONTENT_IMAGE_BASE =
  'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=900&h=560&q=80';

function buildContentImageUri(photoId: string): string {
  return CONTENT_IMAGE_BASE.replace('{id}', photoId);
}

/** 투어 상세 소개·일정 섹션용 이미지 */
export const tourDetailContentImages = {
  nightDiveTorch: buildContentImageUri('1559827260-dc66d52bef19'),
  sokchoBeachSunset: buildContentImageUri('1507525428034-b723cf961d3e'),
  yeosuIsland: buildContentImageUri('1544551763-46a013bb70d5'),
  jejuBoat: buildContentImageUri('1583212292454-1fe6229603b7'),
  philippinesReef: buildContentImageUri('1682687220797-810e8d7902aa'),
  wreckDive: buildContentImageUri('1519452571012-f5f7fd42b89d'),
  liveaboardDeck: buildContentImageUri('1544551763-77a03631423d'),
  kohTaoShore: buildContentImageUri('1578662996442-48f60103fc96'),
} as const;
