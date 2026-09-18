'use client';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useSite } from '@/components/chrome/Providers';
export function RouteLink({ onClick, ...props }: ComponentProps<typeof Link>) {
  const { navigate } = useSite();
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          props.target === '_blank' ||
          props.download
        )
          return;
        const href = String(props.href);
        if (!href.startsWith('/') || href.startsWith('//')) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
