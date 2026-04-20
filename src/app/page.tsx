import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-white max-w-[480px] mx-auto">
      {/* Header */}
      <div className="bg-pf-dark px-6 pt-16 pb-20 flex flex-col items-center gap-1 rounded-b-[40px]">
        <h1
          className="text-pf-green tracking-wider"
          style={{ fontFamily: 'var(--font-bebas)', fontSize: '4.5rem', lineHeight: 1 }}
        >
          PartyRant
        </h1>
        <p
          className="text-white tracking-[0.3em]"
          style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.8rem', lineHeight: 1 }}
        >
          Family
        </p>
        <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mt-2">
          家族で学ぶ、いちばん楽しい方法
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-4 px-6 py-10">
        <Link
          href="/solo"
          className="w-full h-20 bg-pf-green text-white flex flex-col items-center justify-center gap-1 font-bold rounded-[14px] border-[3px] border-pf-dark shadow-[5px_5px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-[transform,box-shadow] duration-75 touch-manipulation"
          style={{ fontFamily: 'var(--font-dm)' }}
        >
          <span className="text-2xl">📚</span>
          <span className="text-lg">ひとりで練習</span>
        </Link>

        <Link
          href="/presets"
          className="w-full h-20 bg-pf-yellow text-pf-dark flex flex-col items-center justify-center gap-1 font-bold rounded-[14px] border-[3px] border-pf-dark shadow-[5px_5px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-[transform,box-shadow] duration-75 touch-manipulation"
          style={{ fontFamily: 'var(--font-dm)' }}
        >
          <span className="text-2xl">🎮</span>
          <span className="text-lg">みんなで遊ぶ</span>
        </Link>

        <Link
          href="/join"
          className="w-full h-16 bg-pf-dark text-white flex items-center justify-center text-base font-bold rounded-[14px] border-[3px] border-pf-dark shadow-[4px_4px_0_#1A1A2E] active:shadow-[2px_2px_0_#1A1A2E] active:translate-x-[2px] active:translate-y-[2px] transition-[transform,box-shadow] duration-75 touch-manipulation"
          style={{ fontFamily: 'var(--font-dm)' }}
        >
          🔑 コードで入室
        </Link>

        <Link
          href="/auth/login"
          className="text-gray-400 text-sm font-bold underline text-center mt-2 touch-manipulation"
          style={{ fontFamily: 'var(--font-dm)' }}
        >
          ホスト・先生はこちら
        </Link>

        <Link href="/lp" className="text-pf-green text-sm font-bold underline text-center">
          PartyRant Family とは？
        </Link>
      </div>
    </main>
  );
}
