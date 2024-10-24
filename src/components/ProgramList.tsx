import React from 'react';
import { Button } from './ui/button';

interface Program {
  id: number;
  program_name: string;
  date: string;
  category: string;
  description: string;
  audio_url: string;
}

interface ProgramListProps {
  programs: Program[];
  onEdit: (program: Program) => void;
  onDelete: (id: number) => void;
}

const ProgramList: React.FC<ProgramListProps> = ({ programs, onEdit, onDelete }) => {
  if (!Array.isArray(programs) || programs.length === 0) {
    return <p className="text-gray-500 italic">No programs available. Add a new program to get started.</p>;
  }

  return (
    <div className="space-y-4">
      {programs.map((program) => (
        <div key={program.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{program.program_name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Date:</span> {new Date(program.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Category:</span> {program.category}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => onEdit(program)} variant="outline" size="sm">
                Edit
              </Button>
              <Button 
                onClick={() => onDelete(program.id)} 
                size="sm"
                className="bg-[rgb(220,38,38)] hover:bg-[rgb(185,28,28)] text-white"
              >
                Delete
              </Button>
            </div>
          </div>
          <p className="text-gray-700 mt-2">{program.description}</p>
          <a 
            href={program.audio_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Listen to Audio
          </a>
        </div>
      ))}
    </div>
  );
};

export default ProgramList;
