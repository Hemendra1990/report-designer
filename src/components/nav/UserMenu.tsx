'use client';

import { User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useAuthProviderContext } from '@/contexts/auth-provider';

export default function UserMenu() {
    const { handleLogOut } = useAuthProviderContext();
  const handleProfileClick = () => {
    console.log('Go to profile');
  };

  const handleSettingsClick = () => {
    console.log('Go to settings');
  };

  const handleLogout = () => {
    handleLogOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <User size={20} className="text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuItem onClick={handleProfileClick}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettingsClick}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
