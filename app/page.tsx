'use client';

import Link from 'next/link';
import { 
  BarChart3, 
  FileText, 
  LayoutDashboard, 
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const quickLinks = [
    {
      title: 'Reports',
      description: 'Create and manage reports',
      icon: FileText,
      href: '/reports',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Dashboards',
      description: 'Visualize your data',
      icon: LayoutDashboard,
      href: '/dashboards',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Report Types',
      description: 'Configure report templates',
      icon: BarChart3,
      href: '/report-types',
      color: 'bg-green-100 text-green-600'
    }
  ];

  const recentItems = [
    {
      title: 'Sales Performance',
      type: 'Dashboard',
      lastViewed: '2 hours ago',
      href: '/dashboards/1'
    },
    {
      title: 'Monthly Revenue',
      type: 'Report',
      lastViewed: '1 day ago',
      href: '/reports/1'
    },
    {
      title: 'Customer Analysis',
      type: 'Report Type',
      lastViewed: '3 days ago',
      href: '/report-types/1'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-lg ${link.color}`}>
                <link.icon size={24} />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{link.title}</h3>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" size={20} />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h2>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y">
            {recentItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center p-4 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <div className="text-sm text-gray-500">{item.lastViewed}</div>
                <ChevronRight className="ml-4 text-gray-400" size={20} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}