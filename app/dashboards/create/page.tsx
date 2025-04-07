'use client';
import DashboardDesigner from '../[id]/page';

export default function CreateDashboardPage() {
  return <DashboardDesigner params={Promise.resolve({ id: 'new' })} />;
}
