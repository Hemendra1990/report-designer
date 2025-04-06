'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Folder } from 'lucide-react';

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
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    folder: 'Private Dashboards'
  });
  
  const handleCreateDashboard = () => {
    if (newDashboard.name.trim()) {
      const dashboard: Dashboard = {
        id: Math.random().toString(36).substr(2, 9),
        name: newDashboard.name,
        description: newDashboard.description,
        folder: newDashboard.folder,
        createdAt: new Date().toISOString()
      };
      
      setDashboards([...dashboards, dashboard]);
      setShowCreateModal(false);
      setNewDashboard({
        name: '',
        description: '',
        folder: 'Private Dashboards'
      });
    }
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Dashboards</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
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
      
      {/* Create Dashboard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Create New Dashboard</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({...newDashboard, name: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dashboard name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({...newDashboard, description: e.target.value})}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter dashboard description"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newDashboard.folder}
                    readOnly
                    className="flex-1 p-2 border rounded-l-md bg-gray-50"
                  />
                  <button className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md hover:bg-gray-200">
                    Select
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-md mr-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDashboard}
                disabled={!newDashboard.name.trim()}
                className={`px-4 py-2 rounded-md ${
                  newDashboard.name.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 