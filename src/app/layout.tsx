import React from 'react';
import type { Metadata } from 'next';
import { Inter, Bebas_Neue, DM_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  weight: ['400', '700', '800'],
  variable: '--font-dm',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PartyRant',
  description: 'パーティーやイベントのためのリアルタイムクイズ＆投票',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="ja"
      className={`${inter.variable} ${bebasNeue.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta
          name="description"
          content="パーティーやイベントのためのリアルタイムクイズ＆投票"
        />
      </head>
      <body className="min-h-full flex flex-col pb-[env(safe-area-inset-bottom)]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
