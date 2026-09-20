import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';
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

  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: false,
      message: `${providerLabels[provider]} 로그인은 Supabase 연동 후 사용할 수 있습니다.`,
    };
  }

  return {
    success: false,
    message: `${providerLabels[provider]} 로그인은 다음 단계에서 제공됩니다.`,
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: '이메일과 비밀번호를 입력해주세요.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true };
  }

  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

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

  const client = getSupabaseClient();
  if (!client) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { success: true };
  }

  const { error } = await client.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: '가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.' };
}

export async function signOut(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  await client.auth.signOut();
}
