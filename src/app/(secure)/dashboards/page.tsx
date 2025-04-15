'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, X, Folder } from 'lucide-react';
import CreateDashboardModal from '@/components/CreateDashboardModal';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

/**
 * Dashboard interface defining the structure of dashboard objects
 */
interface Dashboard {
  id: string;         // Unique identifier for the dashboard
  name: string;       // Display name of the dashboard
  folder: string;     // Folder categorization
  description: string; // Brief description of the dashboard
  createdAt: string;  // ISO timestamp of creation date
}

/**
 * DashboardsPage component - Displays a list of dashboards and allows creation of new ones
 */
export default function DashboardsPage() {
  const router = useRouter();
  
  // Sample dashboard data - would typically come from an API in production
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

  // State for controlling the create dashboard modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State for new dashboard form data
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    folder: 'Private Dashboards'
  });

  /**
   * Handles the creation of a new dashboard
   * @param data - Object containing dashboard properties
   */
  const handleCreateDashboard = (data: { name: string; description: string; folder: string }) => {
    // Generate a new UUID for the dashboard
    const newId = uuidv4();
    const now = new Date().toISOString();

    // Create the new dashboard object
    const newDashboard: Dashboard = {
      id: newId,
      name: data.name,
      description: data.description,
      folder: data.folder,
      createdAt: now
    };

    // Add the new dashboard to the state
    setDashboards([...dashboards, newDashboard]);

    // Close the modal
    setIsCreateModalOpen(false);

    // Navigate to the new dashboard page
    router.push(`/dashboards/${newId}`);
  };

  /**
   * Handles click on "New Dashboard" button - creates and redirects directly
   */
  const handleNewDashboardClick = () => {
    // Generate a new UUID for the dashboard
    const newId = uuidv4();

    // Navigate directly to the new dashboard page
    router.push(`/dashboards/${newId}`);
  };

  /**
   * Formats ISO date string to a readable format
   * @param dateString - ISO date string
   * @returns Formatted date string (e.g., "Jun 15, 2023")
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Navigates to dashboard creation page
   * Note: This function appears unused currently
   */
  const createDashboard = () => {
    router.push('/dashboards/create');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header section with title and new dashboard button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Dashboards</h1>
        <button
          onClick={handleNewDashboardClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Dashboard
        </button>
      </div>

      {/* Dashboard grid layout - responsive columns based on screen size */}
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

      {/* Create Dashboard Modal - currently commented out */}
      {/* <CreateDashboardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDashboard}
      /> */}
    </div>
  );
} 