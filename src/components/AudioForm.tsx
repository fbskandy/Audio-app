'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { supabase } from '../lib/supabaseClient'

interface Program {
  id: number;
  program_name: string;
  date: string;
  category: string;
  description: string;
  audio_url: string;
}

interface AudioFormProps {
  onAddAudio: (formData: FormData) => Promise<Response>;
  onCancel: () => void;
  editingProgram?: Program | null;
}

const categories = [
  "Randiyawara (Rangiri Sri Lanka)",
  "Aswenna (SLBC Kandurata)",
  "Boradiya Mankada (Rangiri Sri Lanka)",
  "Krushi Charika (SLBC Kandurata)",
  "முகடுகள் - Muhaduhal (SLBC Kandurata)",
  "குறிஞ்சிமலர்கள் - Kurinji Malarhal (SLBC Kandurata)",
  "Sarusaara Udesana (Krushi Radio)",
  "Haritha Mansala (Krushi Radio)",
  "Awarjana (Krushi Radio)",
  "Krushi News (Krushi Radio)",
  "Lunch Time Radio (Krushi Radio)",
  "Crop Clinic (Krushi Radio)",
  "Hathara Athe (Krushi Radio)",
  "Sannasa Krushi Puwath",
  "Kadhamalla",
  "Aswedduma",
  "Thirasara",
  "Kethmini Dam",
  "Ruhunu Gewaththa",
  "Krushi Palasa",
  "Krushi Adisi",
  "Koratuwa",
  "Govisara",
  "வயலும் வளமும்",
  "உழவர் இல்லம்",
  "வண்ணமகுதம்",
  "வீட்டுத்தோட்டம்",
  "Short massages"
];

const AudioForm: React.FC<AudioFormProps> = ({ onAddAudio, onCancel, editingProgram }) => {
  const [formData, setFormData] = useState({
    programName: '',
    date: '',
    category: '',
    description: '',
    audioFile: null as File | null,
  });

  useEffect(() => {
    if (editingProgram) {
      setFormData({
        programName: editingProgram.program_name,
        date: editingProgram.date.split('T')[0], // Format date for input
        category: editingProgram.category,
        description: editingProgram.description,
        audioFile: null,
      });
    }
  }, [editingProgram]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prevData) => ({ ...prevData, audioFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.programName || !formData.date || !formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('programName', formData.programName);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    if (formData.audioFile) {
      formDataToSend.append('audioFile', formData.audioFile);
    }
    if (editingProgram) {
      formDataToSend.append('id', editingProgram.id.toString());
      formDataToSend.append('audio_url', editingProgram.audio_url);
    }

    try {
      const response = await fetch('/api/audio', {
        method: editingProgram ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add/update audio entry');
      }

      alert(editingProgram ? 'Audio entry updated successfully!' : 'Audio entry added successfully!');
      if (typeof onCancel === 'function') {
        onCancel();
      }
    } catch (error: unknown) {
      console.error('Error adding/updating audio entry:', error);
      alert(`Failed to add/update audio entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <CardTitle className="text-2xl font-bold">
          {editingProgram ? 'Edit Audio Program' : 'Add New Audio Program'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="programName" className="text-white">Program Name</Label>
            <Textarea
              id="programName"
              name="programName"
              value={formData.programName}
              onChange={handleChange}
              rows={3}
              className="bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-white">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audioFile" className="text-white">Audio File</Label>
            <Input
              type="file"
              id="audioFile"
              name="audioFile"
              onChange={handleFileChange}
              required={!editingProgram}
              accept="audio/*"
              className="bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-600 file:text-white
                hover:file:bg-indigo-700"
            />
          </div>
          <div className="flex justify-between">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingProgram ? 'Update Audio' : 'Add Audio'}
            </Button>
            {typeof onCancel === 'function' && (
              <Button type="button" onClick={onCancel} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AudioForm;
