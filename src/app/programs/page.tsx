'use client';

import React from 'react';
import Link from 'next/link';
import AudioLibrary from '../../components/AudioLibrary';

export default function ProgramsPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Audio Library Programs</h1>
      <div className="mb-4">
        <Link href="/add-program" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200">
          Add New Program
        </Link>
      </div>
      <AudioLibrary />
    </main>
  );
}
