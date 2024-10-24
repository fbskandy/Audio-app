'use client';

import React from 'react';
import { AudioEntry } from './AudioLibrary';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, WhatsappIcon } from 'react-share';

interface AudioListProps {
  audioEntries: AudioEntry[];
}

const AudioList: React.FC<AudioListProps> = ({ audioEntries }) => {
  if (audioEntries.length === 0) {
    return <p>No audio entries found.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Audio Entries</h2>
      <ul className="space-y-4">
        {audioEntries.map((entry) => {
          const filename = entry.audio_url ? entry.audio_url.split('/').pop() : '';
          const fullAudioUrl = filename ? `/api/serve-audio?filename=${filename}` : '';
          const shareUrl = `${window.location.origin}/program/${entry.id}`;
          const shareTitle = `Listen to ${entry.program_name}`;

          return (
            <li key={entry.id} className="p-4 border rounded shadow-sm">
              <h3 className="text-xl font-semibold">{entry.program_name}</h3>
              <p className="text-sm text-gray-600">Date: {entry.date}</p>
              <p className="text-sm text-gray-600">Category: {entry.category}</p>
              <p className="mt-2">{entry.description}</p>
              {fullAudioUrl && (
                <div className="mt-4">
                  <audio controls src={fullAudioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <div className="mt-4 flex space-x-2">
                <FacebookShareButton url={shareUrl}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <WhatsappShareButton url={shareUrl} title={shareTitle}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AudioList;
