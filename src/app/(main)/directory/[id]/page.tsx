
// src/app/(main)/directory/[id]/page.tsx
'use client';

import DirectoryProfileClient from '@/components/directory/DirectoryProfileClient';

export default function DirectoryProfilePage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  return <DirectoryProfileClient id={id} />;
}
