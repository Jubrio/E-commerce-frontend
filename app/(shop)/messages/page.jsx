'use client';

import { Suspense } from 'react';
import MessagesContent from './MessagesContent';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <MessagesContent />
    </Suspense>
  );
}