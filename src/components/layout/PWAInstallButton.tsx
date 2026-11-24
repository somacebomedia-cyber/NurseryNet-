'use client';

import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall, useOnlineStatus } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';

export function PWAInstallButton({ className }: { className?: string }) {
  const { mounted, isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (!mounted || isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={install}
        className={cn(
          'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 font-medium',
          className
        )}
      >
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowGuideModal(true)}
        className={cn(
          'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 font-medium',
          className
        )}
      >
        <Smartphone className="mr-2 h-4 w-4" />
        {isIOS ? 'Install on iOS' : 'Add to Phone'}
      </Button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Add NurseryNet to Your Phone
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {isIOS ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Open this page in <strong>Safari</strong> on your iPhone or iPad.
                </li>
                <li>
                  Tap the <strong>Share</strong> icon at the bottom of the screen.
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
              </ol>
            ) : (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>
                  Open your app URL directly in <strong>Chrome</strong> on your phone.
                </li>
                <li>
                  Tap the <strong>⋮ (three dots)</strong> menu in the top-right corner of Chrome.
                </li>
                <li>
                  Tap <strong>Install app</strong> or <strong>Add to Home screen</strong> to get the purple NurseryNet desktop icon.
                </li>
              </ol>
            )}
            <Button
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      Offline Mode — Viewing cached data
    </div>
  );
}
