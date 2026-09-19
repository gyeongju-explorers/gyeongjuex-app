import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

interface PlaceRow extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  image: string | null;
  image_credit: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
}

interface PlaceWithCompletionRow extends PlaceRow {
  is_completed: number;
}

interface PlaceDetailRow extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  image: string | null;
  image_credit: string | null;
  is_completed: number;
}

const router = Router();

function parseCoordinate(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

const DISTANCE_KM_EXPR = `(
  6371 * ACOS(
    COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?))
    + SIN(RADIANS(?)) * SIN(RADIANS(latitude))
  )
)`;

// GET /api/places?lat=&lng=
// lat/lng이 둘 다 유효하면 가까운 순 정렬, 아니면 id 순으로 정렬.
router.get('/places', requireAuth, async (req: AuthedRequest, res) => {
  const lat = parseCoordinate(req.query.lat);
  const lng = parseCoordinate(req.query.lng);
  const hasLocation = lat !== null && lng !== null;

  try {
    const [rows] = hasLocation
      ? await pool.query<PlaceWithCompletionRow[]>(
          `SELECT p.id, p.name, p.address, p.image, p.image_credit, p.category, p.latitude, p.longitude,
                  ${DISTANCE_KM_EXPR} AS distance_km,
                  (mc.id IS NOT NULL) AS is_completed
           FROM place p
           LEFT JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
           ORDER BY (p.latitude IS NULL OR p.longitude IS NULL), distance_km ASC`,
          [lat, lng, lat, req.userId]
        )
      : await pool.query<PlaceWithCompletionRow[]>(
          `SELECT p.id, p.name, p.address, p.image, p.image_credit, p.category, p.latitude, p.longitude,
                  NULL AS distance_km,
                  (mc.id IS NOT NULL) AS is_completed
           FROM place p
           LEFT JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
           ORDER BY p.id`,
          [req.userId]
        );

    const places = rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      image: row.image,
      imageCredit: row.image_credit,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      distance: row.distance_km !== null ? Math.round(row.distance_km * 10) / 10 : null,
      isCompleted: Boolean(row.is_completed),
    }));

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '장소 목록을 불러오지 못했습니다.' });
  }
});

// GET /api/places/nearby?lat=&lng=&limit= (미션 홈화면 전용, 개수 제한)
router.get('/places/nearby', requireAuth, async (req: AuthedRequest, res) => {
  const lat = parseCoordinate(req.query.lat);
  const lng = parseCoordinate(req.query.lng);

  if (lat === null || lng === null) {
    res.status(400).json({ message: 'lat, lng는 필수입니다.' });
    return;
  }

  const requestedLimit = Number(req.query.limit);
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : 5;

  try {
    const [rows] = await pool.query<PlaceWithCompletionRow[]>(
      `SELECT p.id, p.name, p.address, p.image, p.image_credit, p.category, p.latitude, p.longitude,
              ${DISTANCE_KM_EXPR} AS distance_km,
              (mc.id IS NOT NULL) AS is_completed
       FROM place p
       LEFT JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
       WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL
       ORDER BY distance_km ASC
       LIMIT ?`,
      [lat, lng, lat, req.userId, limit]
    );

    const places = rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      image: row.image,
      imageCredit: row.image_credit,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      distance: row.distance_km !== null ? Math.round(row.distance_km * 10) / 10 : null,
      isCompleted: Boolean(row.is_completed),
    }));

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '근처 미션 장소를 불러오지 못했습니다.' });
  }
});

// GET /api/places/completed?lat=&lng= (일반 사진 촬영 시 사진첩 배정용 — 완료한 미션 장소만, lat/lng 있으면 가까운 순).
router.get('/places/completed', requireAuth, async (req: AuthedRequest, res) => {
  const lat = parseCoordinate(req.query.lat);
  const lng = parseCoordinate(req.query.lng);
  const hasLocation = lat !== null && lng !== null;

  try {
    const [rows] = hasLocation
      ? await pool.query<PlaceWithCompletionRow[]>(
          `SELECT p.id, p.name, p.address, p.image, p.image_credit, p.category, p.latitude, p.longitude,
                  ${DISTANCE_KM_EXPR} AS distance_km,
                  1 AS is_completed
           FROM place p
           INNER JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
           ORDER BY (p.latitude IS NULL OR p.longitude IS NULL), distance_km ASC`,
          [lat, lng, lat, req.userId]
        )
      : await pool.query<PlaceWithCompletionRow[]>(
          `SELECT p.id, p.name, p.address, p.image, p.image_credit, p.category, p.latitude, p.longitude,
                  NULL AS distance_km,
                  1 AS is_completed
           FROM place p
           INNER JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
           ORDER BY mc.completed_at DESC`,
          [req.userId]
        );

    const places = rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      image: row.image,
      imageCredit: row.image_credit,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      distance: row.distance_km !== null ? Math.round(row.distance_km * 10) / 10 : null,
      isCompleted: true,
    }));

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '완료한 미션 장소를 불러오지 못했습니다.' });
  }
});

// GET /api/places/:id
router.get('/places/:id', requireAuth, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: '유효하지 않은 장소 ID입니다.' });
    return;
  }

  try {
    const [rows] = await pool.query<PlaceDetailRow[]>(
      `SELECT p.id, p.name, p.address, p.image, p.image_credit,
              (mc.id IS NOT NULL) AS is_completed
       FROM place p
       LEFT JOIN mission_completion mc ON mc.place_id = p.id AND mc.user_id = ?
       WHERE p.id = ?`,
      [req.userId, id]
    );
    const place = rows[0];

    if (!place) {
      res.status(404).json({ message: '존재하지 않는 장소입니다.' });
      return;
    }

    res.json({
      id: place.id,
      name: place.name,
      address: place.address,
      images: place.image ? [place.image] : [],
      imageCredit: place.image_credit,
      isCompleted: Boolean(place.is_completed),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '장소 상세 정보를 불러오지 못했습니다.' });
  }
});

export default router;
