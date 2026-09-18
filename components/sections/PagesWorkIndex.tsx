'use client';
import { useSearchParams } from 'next/navigation';
import { WorkIndex } from './WorkIndex';
export function PagesWorkIndex() {
  const params = useSearchParams();
  return (
    <WorkIndex initialDomain={params.get('domain') || ''} initialQuery={params.get('q') || ''} />
  );
}
