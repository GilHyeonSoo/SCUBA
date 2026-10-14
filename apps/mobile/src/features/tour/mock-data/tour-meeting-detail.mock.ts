import { tourDetailContentImages } from '@/src/features/tour/mock-data/tour-detail-content-images';
import type { DiveMeeting } from '@/src/features/tour/types';
import type { TourContentBlock, TourMeetingDetailMock } from '@/src/features/tour/types/tour-meeting-detail';

const sharedTerms: TourMeetingDetailMock['terms'] = [
  {
    title: '취소 및 환불',
    paragraphs: [
      '출발 7일 전까지 취소 시 전액 환불됩니다.',
      '출발 3~6일 전 취소 시 결제 금액의 30%가 위약금으로 부과됩니다.',
      '출발 2일 전 이후 취소·노쇼 시 환불이 불가할 수 있습니다.',
    ],
  },
  {
    title: '안전 및 참가 조건',
    paragraphs: [
      '다이빙은 기상·해상 상황에 따라 일정이 변경되거나 취소될 수 있습니다.',
      '참가자는 건강 상태를 스스로 확인해야 하며, 필요 시 의사 소견서를 요청할 수 있습니다.',
      '앱의 모집 정보는 참고용이며, 최종 안전 판단은 현장 가이드·강사 지시를 따릅니다.',
    ],
  },
  {
    title: '개인정보',
    paragraphs: [
      '예약·연락 목적으로 수집된 정보는 투어 운영 기간 동안만 사용됩니다.',
      '참가자 명단은 안전 관리 목적으로 동행 가이드에게 공유될 수 있습니다.',
    ],
  },
];

const tourMeetingDetailById: Record<string, TourMeetingDetailMock> = {
  'meeting-3': {
    meetingId: 'meeting-3',
    profileTagline: '1박 2일, 펀다이브와 나이트 다이빙을 함께하는 속초 패키지',
    profileHighlights: ['1박 숙소 포함', '나이트·주간 3다이브', '전문 가이드 동행'],
    introBlocks: [
      { type: 'heading', text: '1박 2일 속초 다이빙 패키지' },
      {
        type: 'body',
        text:
          '1일차 오후 펀다이브로 몸을 풀고, 숙소에서 휴식한 뒤 2일차 저녁 나이트 다이빙까지 이어지는 1박 2일 패키지입니다. 속초·고성 해안 라인을 중심으로 운영됩니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.sokchoBeachSunset,
        caption: '투어 전 해변에서 진행하는 안전·장비 브리핑',
      },
      { type: 'subheading', text: '이런 분께 추천합니다' },
      {
        type: 'body',
        text: '첫 나이트 다이빙을 계획 중이거나, OW 이상 자격으로 새로운 경험을 원하는 다이버에게 적합합니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.nightDiveTorch,
        caption: '가이드 동행 하 강화된 수중 라이트 점검',
      },
      { type: 'subheading', text: '포함·불포함 안내' },
      {
        type: 'bulletList',
        title: '포함',
        items: ['숙소 1박', '보트 3다이브', '다이빙 가이드', '기본 장비 세트'],
      },
      {
        type: 'bulletList',
        title: '불포함',
        items: ['셔틀·개인 이동', '식사(중·석식)', '다이빙 보험(선택 가입)'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차 · 도착·펀다이브',
          rows: [
            { time: '14:00', activity: '속초 집결·장비 체크' },
            { time: '15:30', activity: '보트 1다이브(펀)' },
            { time: '18:00', activity: '숙소 체크인·브리핑' },
          ],
        },
        {
          dayLabel: '2일차 · 나이트 다이빙',
          rows: [
            { time: '10:00', activity: '오전 1다이브' },
            { time: '17:30', activity: '죽변항 이동' },
            { time: '19:00', activity: '나이트 다이빙' },
            { time: '21:00', activity: '귀환·체크아웃' },
          ],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-5': {
    meetingId: 'meeting-5',
    profileTagline: '2박 3일, 여수 돌산도와 근해 포인트를 돌아보는 다이빙 패키지',
    profileHighlights: ['숙소 2박', '총 6다이브', '장비·선상 식사 포함'],
    introBlocks: [
      { type: 'heading', text: '2박 3일 여수 다이빙' },
      {
        type: 'body',
        text:
          '돌산도와 여수 근해 포인트를 3일간 순환하는 패키지입니다. 1일차 체크다이브·숙소 정착 후, 2~3일차에 본 다이빙을 진행합니다. OW 이상 권장.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.yeosuIsland,
        caption: '돌산도 인근 보트 다이빙 포인트',
      },
      {
        type: 'bulletList',
        title: '포함',
        items: ['숙소 2박', '다이브 6회', '장비 대여', '선상 점심(다이브일)'],
      },
      {
        type: 'bulletList',
        title: '불포함',
        items: ['KTX·여수 이동', '추가 냅탱크', '개인 경비'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차',
          rows: [
            { time: '11:00', activity: '마린센터 집결' },
            { time: '14:00', activity: '체크다이브 1회' },
            { time: '18:00', activity: '숙소 체크인' },
          ],
        },
        {
          dayLabel: '2일차 · 돌산도',
          rows: [
            { time: '09:00', activity: '2다이브' },
            { time: '14:00', activity: '휴식' },
            { time: '16:00', activity: '1다이브' },
          ],
        },
        {
          dayLabel: '3일차',
          rows: [
            { time: '09:00', activity: '2다이브' },
            { time: '15:00', activity: '귀항·체크아웃' },
          ],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-7': {
    meetingId: 'meeting-7',
    profileTagline: '제주 서귀포 2박 3일 보트 다이빙 패키지',
    profileHighlights: ['문섬·범섬 라인', '숙소 연계', '다이브+휴식 균형'],
    introBlocks: [
      { type: 'heading', text: '제주 남부 보트 다이빙' },
      {
        type: 'body',
        text:
          '문섬·범섬 라인을 순환하는 2박 3일 패키지입니다. 일정별로 수심과 난이도를 조절해 다양한 레벨이 함께할 수 있습니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.jejuBoat,
        caption: '서귀포 항 출항 전 보트·장비 점검',
      },
      {
        type: 'bulletList',
        title: '포함',
        items: ['보트 다이브 6회', '숙소 2박', '아침 식사', '다이브 가이드'],
      },
      {
        type: 'bulletList',
        title: '불포함',
        items: ['항공권', '중식·석식', '장비 대여(별도 결제)'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차 · 제주 도착',
          rows: [
            { time: '14:00', activity: '숙소 체크인·장비 피팅' },
            { time: '16:00', activity: '체력 조절 체크다이브 1회' },
          ],
        },
        {
          dayLabel: '2일차 · 문섬',
          rows: [
            { time: '07:00', activity: '항구 출항' },
            { time: '09:00', activity: '오전 2다이브' },
            { time: '14:00', activity: '오후 1다이브' },
          ],
        },
        {
          dayLabel: '3일차 · 범섬·귀항',
          rows: [
            { time: '08:00', activity: '범섬 2다이브' },
            { time: '15:00', activity: '귀항·체크아웃' },
          ],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-8': {
    meetingId: 'meeting-8',
    profileTagline: '필리핀 앙헬라오 산호초 스쿠버 4박 5일',
    profileHighlights: ['해외 리조트 숙박', '장비 포함', '영어·한국어 가이드'],
    introBlocks: [
      { type: 'heading', text: '앙헬라오 리조트 다이빙' },
      {
        type: 'body',
        text: '산호 백화와 열대어를 관찰하는 해외 투어입니다. 리조트 기반으로 이동을 최소화합니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.philippinesReef,
        caption: '앙헬라오 대표 산호 포인트',
      },
      {
        type: 'bulletList',
        title: '포함',
        items: ['리조트 4박', '다이브 10회', '장비·보트', '공항 픽업(그룹)'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차',
          rows: [{ time: 'PM', activity: '픽업·체크인·장비 세팅' }],
        },
        {
          dayLabel: '2~4일차',
          rows: [
            { time: 'AM', activity: '오전 2다이브' },
            { time: 'PM', activity: '오후 1다이브' },
            { time: '야간', activity: '야간 다이브 옵션 1회' },
          ],
        },
        {
          dayLabel: '5일차',
          rows: [{ time: 'AM', activity: '체크아웃·공항 이동' }],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-9': {
    meetingId: 'meeting-9',
    profileTagline: '울진 죽변 난파선 포인트 당일 투어',
    profileHighlights: ['AOW 권장', '2다이브', '동해 특색 포인트'],
    introBlocks: [
      { type: 'heading', text: '죽변 난파선·암반 라인' },
      {
        type: 'body',
        text: '울진 죽변 앞바다를 다이빙하는 당일 투어입니다. 해류·시야에 따라 포인트가 조정될 수 있습니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.wreckDive,
        caption: '동해 난파선·암반 포인트 예시',
      },
      {
        type: 'bulletList',
        title: '포함',
        items: ['2다이브', '장비', '선상 간식'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '당일',
          rows: [
            { time: '08:00', activity: '집결·브리핑' },
            { time: '09:30', activity: '1다이브' },
            { time: '13:00', activity: '2다이브' },
          ],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-10': {
    meetingId: 'meeting-10',
    profileTagline: '몰디브 아리 라이브어보드 5박 6일',
    profileHighlights: ['맨타·호랑상어 스팟', '선상 숙박', '프리미엄 식사'],
    introBlocks: [
      { type: 'heading', text: '아리 아톨 라이브어보드' },
      {
        type: 'body',
        text: '맨타·호랑상어 스팟을 우선 배정하는 순항 투어입니다. 일일 다이브 횟수는 기상에 따라 조정됩니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.liveaboardDeck,
        caption: '선상 데크에서의 브리핑·휴식 공간',
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차 · 승선',
          rows: [{ time: 'PM', activity: '말레 공항 스피드보트 연결·승선 브리핑' }],
        },
        {
          dayLabel: '2~5일차',
          rows: [
            { time: '종일', activity: '일 3~4다이브' },
            { time: '—', activity: '맨타·호랑상어 스팟 우선 배정' },
          ],
        },
        {
          dayLabel: '6일차',
          rows: [{ time: 'AM', activity: '체크아웃·공항 이동' }],
        },
      ],
    },
    terms: sharedTerms,
  },
  'meeting-11': {
    meetingId: 'meeting-11',
    profileTagline: '코타오 OW+펀다이브 3박 4일 입문 패키지',
    profileHighlights: ['교육+펀', '장비 포함', '한국어 스태프'],
    introBlocks: [
      { type: 'heading', text: '코타오 입문 패키지' },
      {
        type: 'body',
        text: '오픈워터 자격과 펀다이브를 한 번에 진행합니다. 풀 세션 후 바다 실습으로 이어집니다.',
      },
      {
        type: 'image',
        uri: tourDetailContentImages.kohTaoShore,
        caption: '코타오 해변 실습 장소',
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '1일차',
          rows: [
            { time: '09:00', activity: '이론 수업' },
            { time: '14:00', activity: '풀 스킬 트레이닝' },
          ],
        },
        {
          dayLabel: '2~3일차',
          rows: [{ time: '종일', activity: 'OW 필수 바다 다이브 완료' }],
        },
        {
          dayLabel: '4일차',
          rows: [{ time: '종일', activity: '펀다이브 2회 후 종료' }],
        },
      ],
    },
    terms: sharedTerms,
  },
};

function buildFallbackTourDetail(meeting: DiveMeeting): TourMeetingDetailMock {
  return {
    meetingId: meeting.id,
    profileTagline: meeting.location,
    profileHighlights: ['전문 가이드 동행', '안전 브리핑 제공'],
    introBlocks: [
      { type: 'heading', text: '투어 소개' },
      {
        type: 'body',
        text: `${meeting.title}에 대한 소개입니다. 상세 일정은 아래 일정표를 참고해 주세요.`,
      },
      {
        type: 'bulletList',
        title: '포함',
        items: ['다이빙 가이드', '기본 안전 장비'],
      },
      {
        type: 'bulletList',
        title: '불포함',
        items: ['개인 경비', '교통비'],
      },
    ],
    scheduleTable: {
      days: [
        {
          dayLabel: '당일',
          rows: [{ time: meeting.time, activity: `${meeting.location} 집결` }],
        },
      ],
    },
    terms: sharedTerms,
  };
}

export function getTourMeetingDetailMock(meeting: DiveMeeting): TourMeetingDetailMock {
  return tourMeetingDetailById[meeting.id] ?? buildFallbackTourDetail(meeting);
}
