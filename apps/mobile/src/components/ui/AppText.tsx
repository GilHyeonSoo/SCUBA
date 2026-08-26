import { Text, TextProps, StyleSheet } from 'react-native';

import { colors, typography, TypographyVariant } from '@/src/constants';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: keyof typeof colors;
};

export function AppText({
  variant = 'body',
  color,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        typography[variant],
        color ? { color: colors[color] } : undefined,
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
}
