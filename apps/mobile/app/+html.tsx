import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalWebStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const globalWebStyles = `
html,
body,
#root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  background-color: #D0D5DD;
  overflow: hidden;
}

/* Expo Router web root */
body > div {
  display: flex;
  flex: 1;
  min-height: 100%;
  width: 100%;
}
`;
