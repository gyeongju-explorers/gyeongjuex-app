import { Router } from 'express';
import multer from 'multer';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { computeGradeProgress } from '../lib/gradeTiers.js';
import { uploadMissionPhoto } from '../lib/s3.js';
import { getRelatedTouristSpots } from '../lib/tourApi.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MISSION_SUCCESS_RADIUS_METERS = 100;
const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Haversine formula — 클라이언트가 이미 판정했더라도 서버에서 다시 검증한다 (신뢰 경계).
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

interface PlaceRow extends RowDataPacket {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface MissionCompletionRow extends RowDataPacket {
  id: number;
}

interface CompletedCountRow extends RowDataPacket {
  count: number;
}

// POST /api/missions/complete (multipart/form-data: photo, placeId, latitude, longitude)
router.post(
  '/missions/complete',
  requireAuth,
  upload.single('photo'),
  async (req: AuthedRequest, res) => {
    const placeId = Number(req.body?.placeId);
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const photo = req.file;

    if (!Number.isInteger(placeId) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      res.status(400).json({ message: '요청 값이 올바르지 않습니다.' });
      return;
    }
    if (!photo) {
      res.status(400).json({ message: '사진이 필요합니다.' });
      return;
    }

    try {
      const [placeRows] = await pool.query<PlaceRow[]>(
        'SELECT id, name, latitude, longitude FROM place WHERE id = ?',
        [placeId],
      );
      const place = placeRows[0];

      if (!place) {
        res.status(404).json({ message: '존재하지 않는 장소입니다.' });
        return;
      }
      if (place.latitude === null || place.longitude === null) {
        res.status(400).json({ message: '이 장소는 위치 정보가 없어 미션을 인증할 수 없습니다.' });
        return;
      }

      const distance = getDistanceInMeters(latitude, longitude, place.latitude, place.longitude);
      if (distance > MISSION_SUCCESS_RADIUS_METERS) {
        res.status(400).json({
          message: `장소에서 약 ${Math.round(distance)}m 떨어져 있어요. ${MISSION_SUCCESS_RADIUS_METERS}m 이내에서 촬영해주세요.`,
        });
        return;
      }

      const photoUrl = await uploadMissionPhoto({
        userId: req.userId!,
        placeId,
        buffer: photo.buffer,
        contentType: photo.mimetype,
      });

      // 이미 완료한 장소를 다시 인증해도 에러 없이 사진만 추가되도록 IGNORE.
      await pool.query('INSERT IGNORE INTO mission_completion (user_id, place_id) VALUES (?, ?)', [
        req.userId,
        placeId,
      ]);
      const [completionRows] = await pool.query<MissionCompletionRow[]>(
        'SELECT id FROM mission_completion WHERE user_id = ? AND place_id = ?',
        [req.userId, placeId],
      );
      const missionCompletionId = completionRows[0]?.id ?? null;

      await pool.query(
        'INSERT INTO photo (user_id, place_id, mission_completion_id, type, image_url) VALUES (?, ?, ?, ?, ?)',
        [req.userId, placeId, missionCompletionId, 'MISSION', photoUrl],
      );

      const [countRows] = await pool.query<CompletedCountRow[]>(
        'SELECT COUNT(*) AS count FROM mission_completion WHERE user_id = ?',
        [req.userId],
      );
      const gradeProgress = computeGradeProgress(countRows[0]?.count ?? 0);
      const relatedPlaces = await getRelatedTouristSpots(place.name);

      res.status(201).json({
        placeName: place.name,
        photoUrl,
        relatedPlaces,
        ...gradeProgress,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '미션 인증 처리에 실패했습니다.' });
    }
  },
);

// GET /api/missions/grade
router.get('/missions/grade', requireAuth, async (req: AuthedRequest, res) => {
  try {
    const [countRows] = await pool.query<CompletedCountRow[]>(
      'SELECT COUNT(*) AS count FROM mission_completion WHERE user_id = ?',
      [req.userId],
    );
    res.json(computeGradeProgress(countRows[0]?.count ?? 0));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '등급 정보를 불러오지 못했습니다.' });
  }
});

export default router;
