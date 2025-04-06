import React from 'react';
import ReportTypeList from '@/components/ReportTypeList';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Report Generator</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ReportTypeList />
      </main>
      <Toaster />
    </div>
  );
}

export default App; 