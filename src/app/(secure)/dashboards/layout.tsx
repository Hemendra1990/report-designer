'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Folder, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  const navigation = [
    { name: 'All Dashboards', href: '/dashboards', icon: LayoutDashboard },
    { name: 'Folders', href: '/dashboards/folders', icon: Folder },
    { name: 'Settings', href: '/dashboards/settings', icon: Settings },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-white border-r shadow-sm transition-all duration-300 ease-in-out relative`}
      >
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-12 bg-white border border-gray-200 rounded-full p-1 shadow-md z-10 text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        <div className={`py-3 px-4 border-b border-gray-100 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <h2 className={`font-bold tracking-tight text-gray-800 ${collapsed ? 'hidden' : 'text-lg'}`}>Dashboards</h2>
          {collapsed && <LayoutDashboard size={22} className="text-gray-700" />}
        </div>
        
        <nav className="py-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-2 py-2 rounded-md mb-0.5 transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-gray-100 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={collapsed ? item.name : ''}
              >
                <item.icon size={collapsed ? 20 : 18} className={`${isActive ? 'text-blue-600' : 'text-gray-500'} ${collapsed ? '' : 'mr-2'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 w-full">
          {children}
        </div>
      </div>
    </div>
  );
} 