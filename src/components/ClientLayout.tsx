'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/context/ThemeContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where the sidebar should be hidden
  const isFullScreenPage = pathname === '/login' || pathname?.startsWith('/admin') || pathname === '/report';

  return (
    <ThemeProvider>
      {!isFullScreenPage && <Sidebar />}
      <div className={isFullScreenPage ? '' : 'main-wrapper'} style={isFullScreenPage ? { marginLeft: 0, width: '100%' } : {}}>
        {children}
      </div>
    </ThemeProvider>
  );
}
