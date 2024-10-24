'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AudioForm from '../../components/AudioForm';
import ProgramList from '../../components/ProgramList';

interface Program {
  id: number;
  program_name: string;
  date: string;
  category: string;
  description: string;
  audio_url: string;
}

export default function AddProgramPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    console.log('Programs state updated:', programs);
  }, [programs]);

  const fetchPrograms = async () => {
    try {
      console.log('Fetching programs...');
      const response = await fetch('/api/audio');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const text = await response.text();
        console.log('Raw response text:', text);
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          setError('Error parsing server response');
          return;
        }
        console.log('Parsed data:', data);
        if (Array.isArray(data)) {
          setPrograms(data);
          console.log('Programs state set:', data);
          setError(null);
        } else {
          console.error('Received data is not an array:', data);
          setError('Received invalid data format');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch programs:', errorText);
        setError(`Failed to fetch programs: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError(`Error fetching programs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddOrUpdateAudio = async (formData: FormData): Promise<Response> => {
    const method = formData.get('id') ? 'PUT' : 'POST';
    console.log('handleAddOrUpdateAudio called, method:', method);
    try {
      const response = await fetch('/api/audio', {
        method,
        body: formData,
      });
      console.log('API response status:', response.status);
      if (response.ok) {
        console.log('Audio entry added/updated successfully');
        setEditingProgram(null);
        console.log('Calling fetchPrograms after successful add/update');
        await fetchPrograms();
      } else {
        const errorText = await response.text();
        console.error('Failed to add/update audio entry:', errorText);
      }
      return response;
    } catch (error) {
      console.error('Error adding/updating audio entry:', error);
      throw error;
    }
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
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

  const handleCancel = () => {
    setEditingProgram(null);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Audio Programs</h1>
      <div className="mb-4">
        <Link href="/programs" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200">
          Back to Programs
        </Link>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {editingProgram ? 'Edit Program' : 'Add New Program'}
        </h2>
        <AudioForm 
          onAddAudio={handleAddOrUpdateAudio} 
          onCancel={handleCancel}
          editingProgram={editingProgram}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Uploaded Programs</h2>
        {programs.length > 0 ? (
          <ProgramList 
            programs={programs} 
            onEdit={handleEditProgram} 
            onDelete={handleDeleteProgram} 
          />
        ) : (
          <p>No programs available. Add a new program to get started.</p>
        )}
      </div>
    </main>
  );
}
