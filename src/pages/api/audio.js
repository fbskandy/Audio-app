// @ts-nocheck
import { supabase } from '../../lib/supabaseClient'
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res)
    case 'PUT':
      return handlePut(req, res)
    case 'DELETE':
      return handleDelete(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function handleGet(req, res) {
  const { data, error } = await supabase
    .from('audio_programs')
    .select('*')
  
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

async function handlePost(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error processing form data' });
    }

    try {
      let audioUrl = '';
      if (files.audioFile) {
        const file = files.audioFile;
        const fileContent = await fs.promises.readFile(file.filepath);
        const { data, error } = await supabase.storage
          .from('audio-files')
          .upload(`${Date.now()}_${file.originalFilename}`, fileContent);

        if (error) throw error;

        const { publicURL, error: urlError } = supabase.storage
          .from('audio-files')
          .getPublicUrl(data.path);

        if (urlError) throw urlError;

        audioUrl = publicURL;
      }

      const { data, error } = await supabase
        .from('audio_programs')
        .insert([{ 
          program_name: fields.programName, 
          date: fields.date, 
          category: fields.category, 
          description: fields.description, 
          audio_url: audioUrl 
        }]);

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error) {
      console.error('Error in handlePost:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

async function handlePut(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error processing form data' });
    }

    try {
      let audioUrl = fields.audio_url;
      if (files.audioFile) {
        const file = files.audioFile;
        const fileContent = await fs.promises.readFile(file.filepath);
        const { data, error } = await supabase.storage
          .from('audio-files')
          .upload(`${Date.now()}_${file.originalFilename}`, fileContent);

        if (error) throw error;

        const { publicURL, error: urlError } = supabase.storage
          .from('audio-files')
          .getPublicUrl(data.path);

        if (urlError) throw urlError;

        audioUrl = publicURL;
      }

      const { data, error } = await supabase
        .from('audio_programs')
        .update({ 
          program_name: fields.programName, 
          date: fields.date, 
          category: fields.category, 
          description: fields.description, 
          audio_url: audioUrl 
        })
        .eq('id', fields.id);

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error in handlePut:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query
    
    const { data, error } = await supabase
      .from('audio_programs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return res.status(200).json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error in handleDelete:', error);
    return res.status(500).json({ error: error.message })
  }
}
