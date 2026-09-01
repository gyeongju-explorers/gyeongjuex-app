import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../db.js';

interface PlaceRow extends RowDataPacket {
  id: number;
  name: string;
  location: string;
  image_url: string | null;
  category: string | null;
}

const router = Router();

// GET /api/places
router.get('/places', async (_req, res) => {
  try {
    const [rows] = await pool.query<PlaceRow[]>(
      'SELECT id, name, location, image_url, category FROM place ORDER BY id'
    );

    const places = rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.location,
      image: row.image_url,
      category: row.category,
    }));

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '장소 목록을 불러오지 못했습니다.' });
  }
});

export default router;
