import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as test');
    connection.release();
    res.status(200).json({ message: 'Database connection successful', result: rows[0] });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed: ' + error.message });
  }
}
