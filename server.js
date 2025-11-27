import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

//import { PrismaClient } from './generated/prisma/client.js'

//dotenv.config()

const app = express()
//const prisma = new PrismaClient()

/*
const secret = process.env.JWT_SECRET

app.use(express.json())

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)
*/

app.get('/', (req, res) => {
  res.send('Hello!')
})

/*
// REGISTER
app.post('/register', async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPw = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPw,
      },
    })

    res.json({ id: user.id, email: user.email })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized! User not found' })
    }

    const isPwValid = await bcrypt.compare(password, user.password)

    if (!isPwValid) {
      return res.status(401).json({ error: 'Invalid password!' })
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })
    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No token found' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, secret)
    req.user = decoded
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ error: 'Invalid token' })
  }
}

// CURRENT USER
app.get('/me', authMiddleware, async (req, res) => {
  const userId = req.user.userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  res.json({ id: user.id, email: user.email })
})

// GET /moods - all moods for current user
app.get('/moods', authMiddleware, async (req, res) => {
  const { userId } = req.user
  try {
    const moods = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { entryDate: 'desc' },
    })
    res.json(moods)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not fetch moods' })
  }
})

// GET /moods/:id - single mood
app.get('/moods/:id', authMiddleware, async (req, res) => {
  const moodId = Number(req.params.id)
  const userId = req.user.userId

  try {
    const mood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
    })

    if (!mood || mood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found' })
    }

    res.json(mood)
  } catch (error) {
    console.error(error)
    res.status(404).json({ error: 'Mood entry not found' })
  }
})

// POST /moods - create new mood entry
app.post('/moods', authMiddleware, async (req, res) => {
  const { mood, emotions, notes } = req.body
  const userId = req.user.userId

  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    return res.status(400).json({ error: 'Mood is required' })
  }

  try {
    const entry = await prisma.moodEntry.create({
      data: {
        mood: mood.trim(),
        emotions: typeof emotions === 'string' ? emotions.trim() : '',
        notes: notes?.trim() || null,
        userId,
      },
    })

    res.status(201).json(entry)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not create mood entry' })
  }
})

// PUT /moods/:id - update mood entry
app.put('/moods/:id', authMiddleware, async (req, res) => {
  const moodId = Number(req.params.id)
  const { mood, emotions, notes } = req.body
  const userId = req.user.userId

  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    return res.status(400).json({ error: 'Mood is required!' })
  }

  try {
    const existingMood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
    })

    if (!existingMood || existingMood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found!' })
    }

    const updated = await prisma.moodEntry.update({
      where: { id: moodId },
      data: {
        mood: mood.trim(),
        emotions: typeof emotions === 'string' ? emotions.trim() : '',
        notes: notes?.trim() || null,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not update mood entry' })
  }
})

// DELETE /moods/:id - delete mood entry
app.delete('/moods/:id', authMiddleware, async (req, res) => {
  const moodId = Number(req.params.id)
  const userId = req.user.userId

  try {
    const existingMood = await prisma.moodEntry.findUnique({
      where: { id: moodId },
    })

    if (!existingMood || existingMood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found!' })
    }

    await prisma.moodEntry.delete({
      where: { id: moodId },
    })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Could not delete mood entry' })
  }
})

*/

app.listen(8000, () => {
  console.log('Server is now running on localhost:8000!')
})
  