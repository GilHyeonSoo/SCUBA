import { SocialAuthProvider } from '@/src/features/auth/types';

/**
 * Supabase OAuth 연동 전 플레이스홀더.
 * 실제 연동 시 provider별 signInWithOAuth 호출로 교체합니다.
 */
export async function signInWithProvider(
  provider: SocialAuthProvider,
): Promise<{ success: boolean; message: string }> {
  const providerLabels: Record<SocialAuthProvider, string> = {
    apple: 'Apple',
    google: 'Google',
    kakao: '카카오',
    naver: '네이버',
  };

  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: false,
    message: `${providerLabels[provider]} 로그인은 Supabase 연동 후 사용할 수 있습니다.`,
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: '이메일과 비밀번호를 입력해주세요.' };
  }

  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  passwordConfirm: string,
): Promise<{ success: boolean; message?: string }> {
  if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
    return { success: false, message: '모든 항목을 입력해주세요.' };
  }

  if (password !== passwordConfirm) {
    return { success: false, message: '비밀번호가 일치하지 않습니다.' };
  }

  if (password.length < 8) {
    return { success: false, message: '비밀번호는 8자 이상이어야 합니다.' };
  }

  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true };
}
