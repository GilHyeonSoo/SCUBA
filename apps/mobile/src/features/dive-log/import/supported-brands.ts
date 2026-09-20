export const SUPPORTED_DIVE_BRANDS = [
  {
    id: 'deepblu',
    name: 'Deepblu',
    route: 'subsurface',
    directFormats: [],
    verified: true,
    note: 'Subsurface export(.ssrf/.xml)로 가져옵니다.',
  },
  {
    id: 'shearwater',
    name: 'Shearwater',
    route: 'both',
    directFormats: ['uddf-xml'],
    verified: false,
    note: 'Shearwater Cloud UDDF 또는 Subsurface XML',
  },
  {
    id: 'suunto',
    name: 'Suunto',
    route: 'both',
    directFormats: ['fit'],
    verified: false,
    note: 'Suunto 앱 FIT export 또는 Subsurface XML',
  },
  {
    id: 'garmin',
    name: 'Garmin Descent',
    route: 'both',
    directFormats: ['fit'],
    verified: false,
    note: 'Garmin Dive/Connect FIT export 또는 Subsurface XML',
  },
  {
    id: 'mares',
    name: 'Mares',
    route: 'subsurface',
    directFormats: [],
    verified: false,
    note: 'Subsurface export(.ssrf/.xml)로 가져옵니다.',
  },
  {
    id: 'oceanic',
    name: 'Oceanic',
    route: 'both',
    directFormats: ['uddf-xml'],
    verified: false,
    note: 'Oceanic+ UDDF 또는 Subsurface XML',
  },
  {
    id: 'scubapro',
    name: 'Scubapro',
    route: 'subsurface',
    directFormats: [],
    verified: false,
    note: 'Subsurface export(.ssrf/.xml)로 가져옵니다.',
  },
  {
    id: 'cressi',
    name: 'Cressi',
    route: 'subsurface',
    directFormats: [],
    verified: false,
    note: 'Subsurface export(.ssrf/.xml)로 가져옵니다.',
  },
  {
    id: 'uwatec',
    name: 'Uwatec / Aladin',
    route: 'subsurface',
    directFormats: [],
    verified: false,
    note: 'Subsurface export(.ssrf/.xml)로 가져옵니다.',
  },
] as const satisfies import('@/src/features/dive-log/types').SupportedBrandInfo[];

export const ACCEPTED_IMPORT_EXTENSIONS = ['.ssrf', '.xml', '.uddf', '.fit'] as const;

export const IMPORT_FORMAT_LABELS: Record<
  import('@/src/features/dive-log/types').DiveImportFormat,
  string
> = {
  'subsurface-xml': 'Subsurface XML',
  'uddf-xml': 'UDDF',
  fit: 'FIT',
};
