import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { PrismaClient } from './generated/prisma/client.js'

// Loads environment variables from .env
dotenv.config()

// Creates the Express application.
const app = express()

// Creates the Prisma client.
const prisma = new PrismaClient()

// Retrieves the JWT secret from environment variables.
const secret = process.env.JWT_SECRET

// Enables JSON request body reading.
app.use(express.json())
// Enables CORS for frontend requests.
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods.
    credentials: true, // Allows cookies and auth headers.
  })
)

// GET route for testing endpoint.
app.get('/', (req, res) => {
  res.send('Hello! This is my web server endpoint!')
})

// POST route for user registration.
app.post('/register', async (req, res) => { // Handles user registration.
  const { email, password } = req.body // Extracts email and password from request body.

  try {
    // Finds a user by email.
    const existingUser = await prisma.user.findUnique({ where: { email } })

    // Returns error if email is already registered.
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hashes the user's password.
    const hashedPw = await bcrypt.hash(password, 10)

    // Creates a new user record in the database.
    const user = await prisma.user.create({
      data: { email, password: hashedPw },
    })
    // Returns the created user's public information.
    res.json({ id: user.id, email: user.email })
  } catch (error) {
    console.error(error)
    // Sends a server error message.
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// POST route for user login.
app.post('/login', async (req, res) => { // Handles user login.
  const { email, password } = req.body // Extracts email and password from request body.

  try {
    // Finds a user by email.
    const user = await prisma.user.findUnique({ where: { email } })

    // Returns error if user does not exist.
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized! User not found' })
    }

    // Validates the password.
    const isPwValid = await bcrypt.compare(password, user.password)

    // Returns error if password is invalid.
    if (!isPwValid) {
      return res.status(401).json({ error: 'Wrong password!' })
    }

    // Creates a JWT token.
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })
    // Returns the generated token.
    res.json({ token })
  } catch (error) {
    console.error(error)
    // Sends a server error message.
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Authentication middleware.
function authMiddleware(req, res, next) {
  
  // Retrieves the Authorization header.
  const authHeader = req.headers.authorization
  // Rejects requests without a token.
  if (!authHeader) {
    return res.status(401).json({ error: 'No token found' })
  }

  try {
    // Extracts the token from the Authorization header in the Bearer format.
    const token = authHeader.split(' ')[1]
    // Verifies the JWT token.
    const decoded = jwt.verify(token, secret)
    // Stores the decoded user information on the request object.
    req.user = decoded
    // Passes control to the next middleware or route handler.
    next()
  } catch (error) {
    console.log(error)
    // Sends an invalid token error message.
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Gets the current authenticated user.
app.get('/me', authMiddleware, async (req, res) => {
  // Retrieves userId from the decoded token.
  const userId = req.user.userId
  // Finds the user by ID.
  const user = await prisma.user.findUnique({ where: { id: userId } })
  // Returns the user's public information.
  res.json({ id: user.id, email: user.email })
})

 // Gets all moods belonging to the user.
app.get('/moods', authMiddleware, async (req, res) => {
  const { userId } = req.user
  try {
    // Retrieves all mood entries for this user.
    const moods = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Sorts moods by newest first.
    })
    // Returns the list of moods.
    res.json(moods)
  } catch (error) {
    console.error(error)
    // Sends an error message if moods cannot be fetched.
    res.status(500).json({ error: 'Could not fetch moods' })
  }
})

// Gets a single mood entry.
app.get('/moods/:id', authMiddleware, async (req, res) => {
  // Converts the ID parameter to a number.
  const moodId = Number(req.params.id)
  // Retrieves the userId from the decoded token.
  const userId = req.user.userId

  try {
    // Finds the mood entry by its ID.
    const mood = await prisma.moodEntry.findUnique({ where: { id: moodId } })

    // Ensures that the mood belongs to the current user.
    if (!mood || mood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found!' })
    }

    // Returns the mood entry.
    res.json(mood)
  } catch (error) {
    console.error(error)
    // Sends an error message if lookup fails.
    res.status(404).json({ error: 'Mood entry not found!' })
  }
})

// Creates a new mood entry.
app.post('/moods', authMiddleware, async (req, res) => {
  // Extracts mood fields from the request body.
  const { mood, emotions, notes } = req.body
  // Retrieves the userId from the decoded token.
  const userId = req.user.userId

  // Ensures that the mood field is provided and not empty.
  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    return res.status(400).json({ error: 'Mood is required' })
  }

  try {
    // Creates a new mood entry in the database.
    const entry = await prisma.moodEntry.create({
      data: {
        mood: mood, // Stores the selected mood value.
        emotions: typeof emotions === 'string' ? emotions.trim() : '', // Stores the provided emotions.
        notes: notes?.trim() || null, // Stores notes or null if none are provided.
        userId, // Links the entry to the authenticated user.
      },
    })

    // Returns the new mood entry.
    res.status(201).json(entry)
  } catch (error) {
    console.error(error)
    // Sends a server error message if the mood entry cannot be created.
    res.status(500).json({ error: 'Could not create mood entry' })
  }
})

// Updates an existing mood entry.
app.put('/moods/:id', authMiddleware, async (req, res) => {
  // Converts the ID parameter to a number.
  const moodId = Number(req.params.id)
  // Extracts mood fields from the request body.
  const { mood, emotions, notes } = req.body
  // Retrieves the userId from the decoded token.
  const userId = req.user.userId

  // Ensures that the mood field is provided and not empty.
  if (!mood || typeof mood !== 'string' || mood.trim() === '') {
    return res.status(400).json({ error: 'Mood is required!' })
  }

  try {
    // Finds the mood entry by its ID.
    const existingMood = await prisma.moodEntry.findUnique({ where: { id: moodId } })

    // Ensures that the mood entry exists and belongs to the current user.
    if (!existingMood || existingMood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found!' })
    }

    // Updates the mood entry in the database.
    const updated = await prisma.moodEntry.update({
      where: { id: moodId },
      data: {
        mood: mood, // Stores the updated mood value.
        emotions: typeof emotions === 'string' ? emotions.trim() : '', // Stores the updated emotions.
        notes: notes?.trim() || null, // Stores updated notes or null if none are provided.
      },
    })

    // Returns the updated mood entry.
    res.json(updated)
  } catch (error) {
    console.error(error)
    // Sends a server error message if the mood entry cannot be updated.
    res.status(500).json({ error: 'Could not update mood entry' })
  }
})

// Deletes a mood entry.
app.delete('/moods/:id', authMiddleware, async (req, res) => {
  // Converts the ID parameter to a number.
  const moodId = Number(req.params.id)
  // Retrieves the userId from the decoded token.
  const userId = req.user.userId

  try {
    // Finds the mood entry by its ID.
    const existingMood = await prisma.moodEntry.findUnique({ where: { id: moodId } })

    // Ensures that the mood entry exists and belongs to the current user.
    if (!existingMood || existingMood.userId !== userId) {
      return res.status(404).json({ error: 'Mood entry not found!' })
    }

    // Deletes the mood entry from the database.
    await prisma.moodEntry.delete({ where: { id: moodId } })

    // Sends successful deletion response.
    res.status(204).send()
  } catch (error) {
    console.error(error)
    // Sends a server error message if the mood entry cannot be deleted.
    res.status(500).json({ error: 'Could not delete mood entry' })
  }
})

// Starts the server on port 8000.
app.listen(8000, () => {
  console.log('Server is now running on localhost:8000!')
})
