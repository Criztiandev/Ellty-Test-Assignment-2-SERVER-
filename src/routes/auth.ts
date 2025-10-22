import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

const router = Router();

interface User {
  id: number;
  email: string;
  password: string;
}

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Email already exists' });
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
          message: 'User created successfully',
          token,
          userId: this.lastID
        });
      }
    );
  } catch (error) {
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

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        userId: user.id
      });
    } catch (error) {
      res.status(500).json({ error: 'Error during login' });
    }
  });
});

export default router;
