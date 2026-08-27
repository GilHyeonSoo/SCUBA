export function formatGearPrice(price: number | null, currency: string | null): string {
  if (price === null) {
    return '가격 정보 없음';
  }

  const resolvedCurrency = currency ?? 'USD';

  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: resolvedCurrency,
      maximumFractionDigits: resolvedCurrency === 'KRW' ? 0 : 2,
    }).format(price);
  } catch {
    return `${price.toLocaleString('ko-KR')} ${resolvedCurrency}`;
  }
}
