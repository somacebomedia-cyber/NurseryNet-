
// src/app/(main)/layout.tsx
import { Suspense } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      {children}
    </Suspense>
  );
}
