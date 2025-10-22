import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/database';

const router = Router();

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
}

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username and password are required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, 'user'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            if (err.message.includes('email')) {
              res.status(400).json({ error: 'Email already exists' });
            } else if (err.message.includes('username')) {
              res.status(400).json({ error: 'Username already exists' });
            } else {
              res.status(400).json({ error: 'Email or username already exists' });
            }
          } else {
            res.status(500).json({ error: 'Error creating user' });
          }
          return;
        }

        const token = jwt.sign(
          { userId: this.lastID },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.status(201).json({
          payload: {
            token,
            user: {
              id: this.lastID,
              email,
              username,
              role: 'user',
            },
          },
          message: 'User created successfully',
        });
      }
    );
  } catch {
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: User | undefined) => {
    if (err) {
      res.status(500).json({ error: 'Error finding user' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    try {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '24h',
      });

      res.json({
        payload: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
        },
        message: 'Login successful',
      });
    } catch {
      res.status(500).json({ error: 'Error during login' });
    }
  });
});

// Password Reset - Request token
router.post('/password-reset', async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  db.get(
    'SELECT id FROM users WHERE username = ?',
    [username],
    async (err, user: { id: number } | undefined) => {
      if (err) {
        res.status(500).json({ error: 'Error finding user' });
        return;
      }

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      try {
        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

        // Delete any existing tokens for this user
        db.run('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id], (deleteErr) => {
          if (deleteErr) {
            res.status(500).json({ error: 'Error creating reset token' });
            return;
          }

          // Insert new token
          db.run(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt],
            function (insertErr) {
              if (insertErr) {
                res.status(500).json({ error: 'Error creating reset token' });
                return;
              }

              res.json({
                payload: {
                  token,
                  expires_at: expiresAt,
                },
                message: 'Reset token generated. Use it to reset your password within 15 minutes.',
              });
            }
          );
        });
      } catch {
        res.status(500).json({ error: 'Error generating reset token' });
      }
    }
  );
});

// Password Reset - Confirm with token
router.post('/password-confirm', async (req: Request, res: Response): Promise<void> => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    res.status(400).json({ error: 'Token and new password are required' });
    return;
  }

  db.get(
    'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?',
    [token],
    async (err, resetToken: { user_id: number; expires_at: string } | undefined) => {
      if (err) {
        res.status(500).json({ error: 'Error validating token' });
        return;
      }

      if (!resetToken) {
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }

      // Check if token is expired
      const expiresAt = new Date(resetToken.expires_at);
      if (expiresAt < new Date()) {
        // Delete expired token
        db.run('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
        res.status(400).json({ error: 'Invalid or expired reset token' });
        return;
      }

      try {
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update user password
        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, resetToken.user_id],
          function (updateErr) {
            if (updateErr) {
              res.status(500).json({ error: 'Error updating password' });
              return;
            }

            // Delete used token
            db.run('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

            res.json({
              payload: { success: true },
              message: 'Password reset successfully',
            });
          }
        );
      } catch {
        res.status(500).json({ error: 'Error resetting password' });
      }
    }
  );
});

export default router;
