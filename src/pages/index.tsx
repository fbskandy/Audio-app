import React from 'react';
import Link from 'next/link';
import AudioLibrary from '../components/AudioLibrary';
import { Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 relative">
      <header className="bg-green-600 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Krushiradio Audio Library</h1>
          <Link 
            href="/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            <Lock className="w-4 h-4 mr-2" />
            Admin Access
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AudioLibrary />
      </main>
      <footer className="bg-green-600 border-t border-green-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-white">© 2023 Krushiradio Audio Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
