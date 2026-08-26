export type GearMaintenanceStatus = 'ok' | 'upcoming' | 'due';

export type GearItem = {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: string;
  diveCount: number;
  lastServiceDate: string;
  serviceInterval: string;
  maintenanceStatus: GearMaintenanceStatus;
  maintenanceMessage: string;
};

export const mockGearItems: GearItem[] = [
  {
    id: 'g1',
    name: 'Regulator',
    manufacturer: 'Scubapro',
    model: 'MK25 / S620',
    category: '레귤레이터',
    diveCount: 98,
    lastServiceDate: '2024-09-12',
    serviceInterval: '12개월 또는 100다이브',
    maintenanceStatus: 'due',
    maintenanceMessage: '점검 예정 · 12개월 또는 100다이브',
  },
  {
    id: 'g2',
    name: 'BCD',
    manufacturer: 'Aqualung',
    model: 'Pro HD',
    category: 'BCD',
    diveCount: 64,
    lastServiceDate: '2025-03-08',
    serviceInterval: '12개월',
    maintenanceStatus: 'ok',
    maintenanceMessage: '정비 상태 양호',
  },
  {
    id: 'g3',
    name: 'Dive Computer',
    manufacturer: 'Shearwater',
    model: 'Peregrine',
    category: '다이빙 컴퓨터',
    diveCount: 112,
    lastServiceDate: '2025-01-20',
    serviceInterval: '배터리 점검 18개월',
    maintenanceStatus: 'upcoming',
    maintenanceMessage: '배터리 점검 2개월 내 권장',
  },
  {
    id: 'g4',
    name: 'Wetsuit',
    manufacturer: 'Fourth Element',
    model: 'Proteus II 5mm',
    category: '웻슈트',
    diveCount: 41,
    lastServiceDate: '2025-06-01',
    serviceInterval: '필요 시 점검',
    maintenanceStatus: 'ok',
    maintenanceMessage: '정비 상태 양호',
  },
  {
    id: 'g5',
    name: 'Mask',
    manufacturer: 'TUSA',
    model: 'M-1001',
    category: '마스크',
    diveCount: 22,
    lastServiceDate: '2025-08-10',
    serviceInterval: '필요 시 교체',
    maintenanceStatus: 'ok',
    maintenanceMessage: '정비 상태 양호',
  },
];

export const gearCategoryFilters = ['전체', '레귤레이터', 'BCD', '다이빙 컴퓨터', '웻슈트'];
