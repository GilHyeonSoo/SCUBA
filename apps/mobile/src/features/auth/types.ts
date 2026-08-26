export type SocialAuthProvider = 'apple' | 'google' | 'kakao' | 'naver';

export type SocialAuthProviderConfig = {
  id: SocialAuthProvider;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  iconLabel: string;
};

export const socialAuthProviders: SocialAuthProviderConfig[] = [
  {
    id: 'kakao',
    label: '카카오로 계속하기',
    backgroundColor: '#FEE500',
    textColor: '#191600',
    iconLabel: 'K',
  },
  {
    id: 'naver',
    label: '네이버로 계속하기',
    backgroundColor: '#03C75A',
    textColor: '#FFFFFF',
    iconLabel: 'N',
  },
  {
    id: 'apple',
    label: 'Apple로 계속하기',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    iconLabel: '',
  },
  {
    id: 'google',
    label: 'Google로 계속하기',
    backgroundColor: '#FFFFFF',
    textColor: '#101828',
    borderColor: '#E4E7EC',
    iconLabel: 'G',
  },
];
