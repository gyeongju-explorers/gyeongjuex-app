import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { deletePhotosByUrl } from '../lib/s3.js';
import { signAccessToken, signRefreshToken } from '../lib/tokens.js';
import { type AuthedRequest, requireAuth } from '../middleware/auth.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string;
  password_hash: string;
}

interface PhotoUrlRow extends RowDataPacket {
  image_url: string;
}

const router = Router();

// GET /user/check-username?username=xxx
router.get('/check-username', async (req, res) => {
  const username = typeof req.query.username === 'string' ? req.query.username.trim() : '';

  if (!username) {
    res.status(400).json({ message: '아이디를 입력해주세요.' });
    return;
  }

  try {
    const [existing] = await pool.query<UserRow[]>('SELECT id FROM user WHERE username = ?', [username]);
    res.json({ available: existing.length === 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '중복 확인에 실패했습니다.' });
  }
});

// POST /user/signup
router.post('/signup', async (req, res) => {
  const { username, nickname, password, passwordConfirm, name } = req.body ?? {};

  if (!username || !nickname || !password || !passwordConfirm || !name) {
    res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    return;
  }
  if (password !== passwordConfirm) {
    res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    return;
  }

  try {
    const [existing] = await pool.query<UserRow[]>('SELECT id FROM user WHERE username = ?', [username]);
    if (existing.length > 0) {
      res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO user (username, nickname, password_hash, name) VALUES (?, ?, ?, ?)',
      [username, nickname, passwordHash, name]
    );

    res.status(201).json({ id: result.insertId, username, nickname });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '회원가입에 실패했습니다.' });
  }
});

// POST /user/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
    return;
  }

  try {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, username, nickname, password_hash FROM user WHERE username = ?',
      [username]
    );
    const user = rows[0];
    const isValid = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !isValid) {
      res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    res.json({
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(user.id),
      user: { id: user.id, nickname: user.nickname },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '로그인에 실패했습니다.' });
  }
});

// DELETE /user
// 회원 탈퇴: 사용자가 소유한 사진/미션 완료 기록을 먼저 지우고 사용자 행을 삭제.
router.delete('/', requireAuth, async (req: AuthedRequest, res) => {
  const connection = await pool.getConnection();
  let photoUrls: string[] = [];

  try {
    const [photoRows] = await connection.query<PhotoUrlRow[]>(
      'SELECT image_url FROM photo WHERE user_id = ?',
      [req.userId],
    );
    photoUrls = photoRows.map((row) => row.image_url);

    await connection.beginTransaction();
    await connection.query('DELETE FROM photo WHERE user_id = ?', [req.userId]);
    await connection.query('DELETE FROM mission_completion WHERE user_id = ?', [req.userId]);
    await connection.query('DELETE FROM user WHERE id = ?', [req.userId]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: '회원 탈퇴에 실패했습니다.' });
    return;
  } finally {
    connection.release();
  }

  res.status(204).send();

  // S3 삭제는 트랜잭션으로 묶이지 않으므로 DB 삭제가 끝난 뒤 별도로 시도하고,
  // 실패해도 이미 응답은 보낸 상태라 로그만 남긴다.
  try {
    await deletePhotosByUrl(photoUrls);
  } catch (err) {
    console.error('S3 사진 삭제 실패:', err);
  }
});

export default router;
