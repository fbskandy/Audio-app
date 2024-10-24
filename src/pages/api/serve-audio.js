import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': stat.size
    });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}
