// @ts-nocheck
import { supabase } from '../../lib/supabaseClient'

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
  const { program_name, date, category, description, audio_url } = req.body
  
  const { data, error } = await supabase
    .from('audio_programs')
    .insert([{ program_name, date, category, description, audio_url }])
  
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}

async function handlePut(req, res) {
  const { id, program_name, date, category, description, audio_url } = req.body
  
  const { data, error } = await supabase
    .from('audio_programs')
    .update({ program_name, date, category, description, audio_url })
    .eq('id', id)
  
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}

async function handleDelete(req, res) {
  const { id } = req.query
  
  const { data, error } = await supabase
    .from('audio_programs')
    .delete()
    .eq('id', id)
  
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ message: 'Program deleted successfully' })
}
