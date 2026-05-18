import localFont from 'next/font/local'
import { JetBrains_Mono } from 'next/font/google'

export const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  variable: '--font-sans',
  weight: '45 920',
  fallback: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Apple SD Gothic Neo',
    'Noto Sans KR',
    'Roboto',
    'Helvetica Neue',
    'Segoe UI',
    'sans-serif',
  ],
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  fallback: ['ui-monospace', 'Menlo', 'Monaco', 'monospace'],
})
