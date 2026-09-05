import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import { pool } from '../db.js';
import { signAccessToken, signRefreshToken } from '../lib/tokens.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  nickname: string;
  password_hash: string;
}

const router = Router();

// POST /user/signup
// 휴대폰 인증(SMS) 연동이 아직 없어서 verificationCode는 받지 않음. 연동 붙으면 여기에 검증 추가.
router.post('/signup', async (req, res) => {
  const { username, nickname, password, passwordConfirm, name, phone } = req.body ?? {};

  if (!username || !nickname || !password || !passwordConfirm || !name || !phone) {
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
      'INSERT INTO user (username, nickname, password_hash, name, phone) VALUES (?, ?, ?, ?, ?)',
      [username, nickname, passwordHash, name, phone]
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

export default router;
