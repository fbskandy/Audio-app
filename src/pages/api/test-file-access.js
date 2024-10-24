import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    const files = await fs.readdir(uploadsDir);
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    res.status(500).json({ error: 'Error reading uploads directory' });
  }
}
