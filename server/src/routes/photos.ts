import { Router } from 'express';
import multer from 'multer';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { uploadMissionPhoto } from '../lib/s3.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

interface MissionCompletionRow extends RowDataPacket {
  id: number;
}

// POST /api/photos (multipart/form-data: photo, placeId)
// 미션을 이미 완료한 장소에 대해서만 추가 사진을 찍어 그 장소 사진첩에 담는다.
router.post('/photos', requireAuth, upload.single('photo'), async (req: AuthedRequest, res) => {
  const placeId = Number(req.body?.placeId);
  const photo = req.file;

  if (!Number.isInteger(placeId)) {
    res.status(400).json({ message: '장소를 선택해주세요.' });
    return;
  }
  if (!photo) {
    res.status(400).json({ message: '사진이 필요합니다.' });
    return;
  }

  try {
    const [completionRows] = await pool.query<MissionCompletionRow[]>(
      'SELECT id FROM mission_completion WHERE user_id = ? AND place_id = ?',
      [req.userId, placeId],
    );
    const missionCompletion = completionRows[0];

    if (!missionCompletion) {
      res.status(400).json({ message: '이 장소는 아직 미션을 완료하지 않았어요.' });
      return;
    }

    const photoUrl = await uploadMissionPhoto({
      userId: req.userId!,
      placeId,
      buffer: photo.buffer,
      contentType: photo.mimetype,
    });

    await pool.query(
      'INSERT INTO photo (user_id, place_id, mission_completion_id, type, image_url) VALUES (?, ?, ?, ?, ?)',
      [req.userId, placeId, missionCompletion.id, 'GENERAL', photoUrl],
    );

    res.status(201).json({ photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '사진 저장에 실패했습니다.' });
  }
});

export default router;
