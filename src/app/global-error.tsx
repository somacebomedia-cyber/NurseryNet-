'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 font-sans antialiased text-center bg-gray-50 text-gray-900">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold mb-4">
            !
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
          <p className="text-gray-600 mb-6 text-sm">
            A critical system error occurred. We apologize for the inconvenience. Please refresh or click the button below to recover.
          </p>
          <button
            onClick={() => reset()}
            className="w-full rounded-xl bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition shadow-sm"
          >
            Reload NurseryNet
          </button>
        </div>
      </body>
    </html>
  );
}
