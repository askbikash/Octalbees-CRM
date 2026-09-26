import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="flex w-full gap-4 p-4 border-b border-slate-200 dark:border-zinc-800">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded" />
        ))}
      </div>
      {/* Rows Skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex w-full gap-4 p-4 border-b border-slate-100 dark:border-zinc-800/50">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-20 w-full mt-2" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      {/* Chart Skeleton */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-96 flex flex-col">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="flex-1 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-6 h-full overflow-hidden pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-[300px] w-[300px] bg-slate-50 dark:bg-zinc-900/50 rounded-2xl flex flex-col p-4 border border-slate-200 dark:border-zinc-800">
          <div className="flex justify-between mb-4">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <CardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 h-64">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 h-96">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
