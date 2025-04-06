'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Folder, Settings } from 'lucide-react';

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'All Dashboards', href: '/dashboards', icon: LayoutDashboard },
    { name: 'Folders', href: '/dashboards/folders', icon: Folder },
    { name: 'Settings', href: '/dashboards/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Dashboards</h2>
        </div>
        <nav className="p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md mb-1 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 