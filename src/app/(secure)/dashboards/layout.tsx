'use client';

import React from 'react';

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
} 