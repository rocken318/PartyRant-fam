'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function GameQRCode({ joinCode }: { joinCode: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/join/${joinCode}`);
  }, [joinCode]);

  if (!url) {
    return (
      <div className="w-64 h-64 bg-gray-100 rounded-[8px] border-[3px] border-pr-dark animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-4 bg-white rounded-[8px] border-[3px] border-pr-dark shadow-[5px_5px_0_#111]">
        <QRCodeSVG value={url} size={224} />
      </div>
      <p className="text-xs text-gray-400 text-center break-all max-w-xs">
        {url}
      </p>
    </div>
  );
}
