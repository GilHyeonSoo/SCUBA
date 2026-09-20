import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { FadeInView } from '@/src/components/motion';
import { AppButton, AppInput, AppText } from '@/src/components/ui';
import { colors, gradients, layout, radius, spacing } from '@/src/constants';
import {
  signInWithEmail,
  signInWithProvider,
  signUpWithEmail,
} from '@/src/features/auth/auth-service';
import { AuthDivider } from '@/src/features/auth/components/AuthDivider';
import { SocialLoginButton } from '@/src/features/auth/components/SocialLoginButton';
import {
  SocialAuthProvider,
  socialAuthProviders,
} from '@/src/features/auth/types';
import { getSupabaseSession } from '@/src/features/social/api/session';
import { getSupabaseClient } from '@/src/services/supabase';
import { useAuthStore } from '@/src/stores/auth-store';

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ mode = 'login' }: { mode?: AuthMode }) {
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [authMode, setAuthMode] = useState<AuthMode>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<SocialAuthProvider | null>(
    null,
  );
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = authMode === 'signup';

  const handleSocialLogin = async (provider: SocialAuthProvider) => {
    setLoadingProvider(provider);
    setError(null);

    const result = await signInWithProvider(provider);
    setLoadingProvider(null);

    if (!result.success) {
      Alert.alert('준비 중', result.message);
      return;
    }

    setAuthenticated(true);
    router.replace('/(tabs)');
  };

  const handleEmailSubmit = async () => {
    setEmailLoading(true);
    setError(null);

    const result = isSignup
      ? await signUpWithEmail(email, password, passwordConfirm)
      : await signInWithEmail(email, password);

    setEmailLoading(false);

    if (!result.success) {
      setError(result.message ?? '요청을 처리하지 못했습니다.');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setAuthenticated(true);
      router.replace('/(tabs)');
      return;
    }

    const session = await getSupabaseSession();
    if (session) {
      router.replace('/(tabs)');
      return;
    }

    if (isSignup) {
      Alert.alert('가입 완료', result.message ?? '이메일 인증 후 로그인해 주세요.');
      setAuthMode('login');
      setPassword('');
      setPasswordConfirm('');
      return;
    }

    setError('로그인 세션을 확인하지 못했습니다.');
  };

  const toggleMode = () => {
    setAuthMode(isSignup ? 'login' : 'signup');
    setError(null);
    setPassword('');
    setPasswordConfirm('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[...gradients.heroSoft]} style={styles.heroGradient}>
        <FadeInView>
          <AppText variant="caption" style={styles.eyebrow}>
            DIVE PLATFORM
          </AppText>
          <AppText variant="display" style={styles.brand}>
            SCUBA
          </AppText>
          <AppText variant="bodySmall" style={styles.subtitle}>
            스쿠버·프리다이빙 통합 플랫폼
          </AppText>
        </FadeInView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FadeInView index={1}>
          <AppText variant="h2">{isSignup ? '회원가입' : '로그인'}</AppText>
          <AppText variant="bodySmall" style={styles.description}>
            카카오, 네이버, Apple, Google 또는 이메일로 시작하세요.
          </AppText>
        </FadeInView>

        <FadeInView index={2}>
          <View style={styles.socialList}>
            {socialAuthProviders.map((provider) => (
              <SocialLoginButton
                key={provider.id}
                provider={provider}
                loading={loadingProvider === provider.id}
                disabled={loadingProvider !== null || emailLoading}
                onPress={() => handleSocialLogin(provider.id)}
              />
            ))}
          </View>
        </FadeInView>

        <FadeInView index={3}>
          <AuthDivider />

          <View style={styles.form}>
            <AppInput
              label="이메일"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@example.com"
              error={error ?? undefined}
            />
            <AppInput
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={isSignup ? '8자 이상' : '비밀번호'}
            />
            {isSignup ? (
              <AppInput
                label="비밀번호 확인"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                placeholder="비밀번호 다시 입력"
              />
            ) : null}
          </View>

          <AppButton
            label={isSignup ? '이메일로 가입하기' : '이메일로 로그인'}
            size="lg"
            fullWidth
            loading={emailLoading}
            disabled={loadingProvider !== null}
            onPress={handleEmailSubmit}
            style={styles.submitButton}
          />

          <View style={styles.switchRow}>
            <AppText variant="bodySmall">
              {isSignup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}
            </AppText>
            <AppText variant="label" color="primary" onPress={toggleMode}>
              {isSignup ? '로그인' : '회원가입'}
            </AppText>
          </View>

          <AppButton
            label="둘러보기 (로그인 없이)"
            variant="ghost"
            fullWidth
            onPress={() => router.replace('/(tabs)')}
          />
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroGradient: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing['4xl'],
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  eyebrow: {
    letterSpacing: 2,
    color: colors.ocean,
    fontWeight: '600',
  },
  brand: {
    letterSpacing: -1,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  description: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  socialList: {
    gap: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
