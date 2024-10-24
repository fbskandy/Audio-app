// @ts-nocheck
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import pool from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('API route called, method:', req.method);

  if (req.method === 'POST' || req.method === 'PUT') {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    form.keepExtensions = true;

    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const { id, programName, date, category, description } = fields;
      const audioFile = files.audioFile;

      let audioUrl = null;
      if (audioFile && audioFile[0]) {
        const uniqueFilename = `${Date.now()}-${audioFile[0].originalFilename}`;
        const newFilePath = path.join(form.uploadDir, uniqueFilename);
        await fs.rename(audioFile[0].filepath, newFilePath);
        audioUrl = `/uploads/${uniqueFilename}`;
      }

      if (req.method === 'POST') {
        const [result] = await pool.query(
          'INSERT INTO audio_entries (program_name, date, category, description, audio_url) VALUES (?, ?, ?, ?, ?)',
          [programName[0], date[0], category[0], description[0], audioUrl]
        );
        res.status(201).json({ message: 'Audio entry added successfully', id: result.insertId });
      } else if (req.method === 'PUT') {
        const updateQuery = audioUrl
          ? 'UPDATE audio_entries SET program_name = ?, date = ?, category = ?, description = ?, audio_url = ? WHERE id = ?'
          : 'UPDATE audio_entries SET program_name = ?, date = ?, category = ?, description = ? WHERE id = ?';
        
        const updateParams = audioUrl
          ? [programName[0], date[0], category[0], description[0], audioUrl, id[0]]
          : [programName[0], date[0], category[0], description[0], id[0]];

        await pool.query(updateQuery, updateParams);
        res.status(200).json({ message: 'Audio entry updated successfully' });
      }
    } catch (error) {
      console.error('Error processing audio entry:', error);
      res.status(500).json({ error: 'Error processing audio entry: ' + error.message });
    }
  } else if (req.method === 'GET') {
    try {
      console.log('GET request received');
      const connection = await pool.getConnection();
      console.log('Database connection established');

      const [rows] = await connection.query('SELECT * FROM audio_entries ORDER BY date DESC');
      console.log('Query executed, number of rows:', rows.length);

      connection.release();

      if (rows.length === 0) {
        console.log('No audio entries found');
        return res.status(200).json([]);
      }

      console.log('First row:', JSON.stringify(rows[0], null, 2));

      const entriesWithFileCheck = await Promise.all(rows.map(async (row) => {
        const filePath = path.join(process.cwd(), 'public', row.audio_url);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        return { 
          ...row, 
          fileExists,
          audio_url: row.audio_url.startsWith('/') ? row.audio_url : `/${row.audio_url}`
        };
      }));

      console.log('Sending response with', entriesWithFileCheck.length, 'entries');
      res.status(200).json(entriesWithFileCheck);
    } catch (error) {
      console.error('Error fetching audio entries:', error);
      res.status(500).json({ error: 'Error fetching audio entries: ' + error.message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      // First, get the audio_url to delete the file
      const [rows] = await pool.query('SELECT audio_url FROM audio_entries WHERE id = ?', [id]);
      if (rows.length > 0) {
        const audioUrl = rows[0].audio_url;
        const filePath = path.join(process.cwd(), 'public', audioUrl);
        await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
      }

      // Then, delete the database entry
      await pool.query('DELETE FROM audio_entries WHERE id = ?', [id]);

      res.status(200).json({ message: 'Audio entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting audio entry:', error);
      res.status(500).json({ error: 'Error deleting audio entry: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
