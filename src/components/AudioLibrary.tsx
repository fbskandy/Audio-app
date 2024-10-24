'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Share2, Download, Play, Pause, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export interface AudioEntry {
  id: number;
  program_name: string;
  date: string;
  category: string;
  description: string;
  audio_url: string;
  fileExists: boolean;
}

const ITEMS_PER_PAGE = 9; // 3 columns * 3 rows

const AudioLibrary: React.FC = () => {
  const [audioEntries, setAudioEntries] = useState<AudioEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AudioEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filterEntries = useCallback(() => {
    const filtered = audioEntries.filter((entry) => {
      const matchesSearch = 
        entry.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const entryDate = new Date(entry.date);
      const isAfterStartDate = startDate ? entryDate >= new Date(startDate) : true;
      const isBeforeEndDate = endDate ? entryDate <= new Date(endDate) : true;

      return matchesSearch && isAfterStartDate && isBeforeEndDate;
    });
    setFilteredEntries(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [audioEntries, searchTerm, startDate, endDate]);

  useEffect(() => {
    filterEntries();
  }, [filterEntries, searchTerm, startDate, endDate]);

  useEffect(() => {
    fetchAudioEntries();
  }, []);

  const fetchAudioEntries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/audio');
      if (!response.ok) {
        throw new Error('Failed to fetch audio entries');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setAudioEntries(data);
        setFilteredEntries(data);
      } else {
        throw new Error('Received invalid data format');
      }
    } catch (error) {
      console.error('Error fetching audio entries:', error);
      setError('Failed to load audio entries. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePlay = (id: number, audioUrl: string) => {
    if (currentlyPlaying === id) {
      audioRef.current?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
      setCurrentlyPlaying(id);
    }
  };

  const handleShare = async (entry: AudioEntry) => {
    const shareUrl = `${window.location.origin}/program/${entry.id}`;
    const shareText = `Listen to ${entry.program_name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.program_name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = (audioUrl: string, programName: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${programName}.mp3`; // Assuming it's an MP3 file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDescription = (id: number) => {
    setExpandedDescriptions(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const pageCount = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Krushiradio Audio Collection</h2>
        <p className="text-green-600">Discover and listen to our curated agricultural radio programs</p>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="search"
          placeholder="Search Krushiradio programs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full md:w-auto"
        />
        <Input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedEntries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-green-700 font-bold text-lg">
                      {getInitials(entry.program_name)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{entry.program_name}</CardTitle>
                      <p className="text-sm opacity-75">{entry.category} • {new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <p className={`text-green-800 ${!expandedDescriptions.includes(entry.id) && 'line-clamp-2'}`}>
                      {entry.description}
                    </p>
                    {entry.description.length > 100 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => toggleDescription(entry.id)}
                        className="mt-1 p-0 h-auto font-normal text-black hover:text-gray-700"
                      >
                        {expandedDescriptions.includes(entry.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Read Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Read More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => handlePlay(entry.id, entry.audio_url)} className="flex-1 mr-2 bg-white text-black border-black hover:bg-gray-100">
                      {currentlyPlaying === entry.id ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {currentlyPlaying === entry.id ? 'Pause' : 'Play'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(entry)} className="mr-2 bg-white text-black border-black hover:bg-gray-100">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(entry.audio_url, entry.program_name)} className="bg-white text-black border-black hover:bg-gray-100">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center items-center space-x-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-green-700 font-medium">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </>
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default AudioLibrary;
