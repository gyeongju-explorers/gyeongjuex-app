import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

interface FeaturedRow extends RowDataPacket {
  completed_at: string;
  photo_url: string | null;
}

interface PhotoRow extends RowDataPacket {
  image_url: string;
}

interface DatedPhotoRow extends RowDataPacket {
  image_url: string;
  created_at: string;
}

const FEATURED_COUNT = 3;

const router = Router();

// GET /api/record
// 기록 페이지(FeaturedPhoto / 미션 모아보기 / 최근 찍은 사진 모아보기)에 필요한 데이터를 한 번에 내려줌.
router.get('/record', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const [featuredRows] = await pool.query<FeaturedRow[]>(
      `SELECT mc.completed_at,
              (SELECT ph.image_url FROM photo ph
               WHERE ph.mission_completion_id = mc.id ORDER BY ph.id ASC LIMIT 1) AS photo_url
       FROM mission_completion mc
       WHERE mc.user_id = ?
       ORDER BY mc.completed_at DESC
       LIMIT ?`,
      [req.userId, FEATURED_COUNT]
    );

    const [missionPhotoRows] = await pool.query<PhotoRow[]>(
      `SELECT image_url FROM photo WHERE user_id = ? AND type = 'MISSION' ORDER BY created_at DESC`,
      [req.userId]
    );

    const [cameraPhotoRows] = await pool.query<DatedPhotoRow[]>(
      `SELECT image_url, created_at FROM photo WHERE user_id = ? AND type = 'GENERAL' ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({
      featured: {
        photos: featuredRows
          .filter((row): row is FeaturedRow & { photo_url: string } => row.photo_url !== null)
          .map((row) => ({ photoUrl: row.photo_url, completedAt: row.completed_at })),
      },
      mission: {
        photos: missionPhotoRows.map((row) => row.image_url),
      },
      camera: {
        photos: cameraPhotoRows.map((row) => ({ photoUrl: row.image_url, createdAt: row.created_at })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '기록을 불러오지 못했습니다.' });
  }
});

export default router;
