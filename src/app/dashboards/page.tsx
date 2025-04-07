'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Folder } from 'lucide-react';
import CreateDashboardModal from '@/components/CreateDashboardModal';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  folder: string;
  createdAt: string;
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: '1',
      name: 'HemendraTest',
      description: 'A test dashboard for demonstration',
      folder: 'Private Dashboards',
      createdAt: '2023-06-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Sales Overview',
      description: 'Key sales metrics and performance indicators',
      folder: 'Private Dashboards',
      createdAt: '2023-06-10T14:45:00Z'
    }
  ]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    folder: 'Private Dashboards'
  });
  
  const handleCreateDashboard = (data: { name: string; description: string; folder: string }) => {
    // TODO: Implement dashboard creation logic
    console.log('Creating dashboard:', data);
    setIsCreateModalOpen(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboards</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((dashboard) => (
          <Link 
            key={dashboard.id} 
            href={`/dashboards/${dashboard.id}`}
            className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold mb-1">{dashboard.name}</h2>
                <span className="text-xs text-gray-500">{formatDate(dashboard.createdAt)}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{dashboard.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Folder size={14} className="mr-1" />
                {dashboard.folder}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <CreateDashboardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDashboard}
      />
    </div>
  );
} 