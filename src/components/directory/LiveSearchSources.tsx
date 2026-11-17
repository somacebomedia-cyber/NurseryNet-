"use client";

import { ExternalLink, Globe } from 'lucide-react';
import { LiveSearchSource } from '@/lib/live-search-types';

interface LiveSearchSourcesProps {
  sources: LiveSearchSource[];
  searchedAt?: string;
}

export default function LiveSearchSources({ sources, searchedAt }: LiveSearchSourcesProps) {
  if ((!sources || sources.length === 0) && !searchedAt) {
    return null;
  }

  const formattedTime = searchedAt
    ? new Date(searchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="pt-3 mt-3 border-t border-border/60 flex flex-col gap-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/80">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>Web Sources Cited</span>
        </span>
        {formattedTime && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            Checked via Google Search · {formattedTime}
          </span>
        )}
      </div>

      {sources && sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {sources.map((src, idx) => (
            <span key={`${src.uri}-${idx}`} className="inline-flex items-center gap-1.5">
              {idx > 0 && (
                <span aria-hidden="true" className="text-muted-foreground/40">
                  ·
                </span>
              )}
              <a
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium max-w-[240px] truncate"
                title={src.title}
              >
                <span className="truncate">{src.title}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
