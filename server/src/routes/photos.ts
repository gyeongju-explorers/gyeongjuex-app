import { Router } from 'express';
import multer from 'multer';

import { uploadGeneralPhoto } from '../lib/s3.js';
import { pool } from '../db.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/photos (multipart/form-data: photo)
// 특정 장소/미션에 묶이지 않는 일반 카메라 사진 — 그냥 내가 찍은 사진 모음(기록 페이지의
// "최근 찍은 사진 모아보기")에 들어간다.
router.post('/photos', requireAuth, upload.single('photo'), async (req: AuthedRequest, res) => {
  const photo = req.file;

  if (!photo) {
    res.status(400).json({ message: '사진이 필요합니다.' });
    return;
  }

  try {
    const photoUrl = await uploadGeneralPhoto({
      userId: req.userId!,
      buffer: photo.buffer,
      contentType: photo.mimetype,
    });

    await pool.query(
      'INSERT INTO photo (user_id, place_id, mission_completion_id, type, image_url) VALUES (?, NULL, NULL, ?, ?)',
      [req.userId, 'GENERAL', photoUrl],
    );

    res.status(201).json({ photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사진 저장에 실패했습니다.' });
  }
});

export default router;
