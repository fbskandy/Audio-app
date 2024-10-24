'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AudioForm from '../../components/AudioForm';
import ProgramList from '../../components/ProgramList';
import { Button } from '../../components/ui/button';
import { useRouter } from 'next/navigation';

interface Program {
  id: number;
  program_name: string;
  date: string;
  category: string;
  description: string;
  audio_url: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setIsLoading(false);
      fetchPrograms();
    }
  }, [router]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/audio');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      } else {
        setError('Failed to fetch programs');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Error fetching programs');
    }
  };

  const handleAddOrUpdateAudio = async (formData: FormData): Promise<Response> => {
    const method = formData.get('id') ? 'PUT' : 'POST';
    try {
      const response = await fetch('/api/audio', {
        method,
        body: formData,
      });
      if (response.ok) {
        setEditingProgram(null);
        setIsAdding(false);
        fetchPrograms();
      }
      return response;
    } catch (error) {
      console.error('Error adding/updating audio entry:', error);
      throw error;
    }
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setIsAdding(true);
  };

  const handleDeleteProgram = async (id: number) => {
    if (confirm('Are you sure you want to delete this program?')) {
      try {
        const response = await fetch(`/api/audio?id=${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchPrograms();
        }
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Public View
              </Link>
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdding ? (editingProgram ? 'Edit Program' : 'Add New Program') : 'Manage Programs'}
          </h1>
          {!isAdding && (
            <Button 
              onClick={() => setIsAdding(true)} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add New Program
            </Button>
          )}
        </div>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {isAdding ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <AudioForm 
              onAddAudio={handleAddOrUpdateAudio} 
              onCancel={() => {
                setIsAdding(false);
                setEditingProgram(null);
              }} 
              editingProgram={editingProgram} 
            />
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Uploaded Programs</h2>
              <ProgramList 
                programs={programs} 
                onEdit={handleEditProgram} 
                onDelete={handleDeleteProgram} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
