// index.js
require('dotenv').config() // 3.12: Load MONGODB_URI from .env for database connection
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const Person = require('./models/person') // 3.12 & 3.13: Mongoose model for phonebook entries

const app = express()

// ===== 3.1: Phonebook backend step 1 =====
// Express app setup to return data from /api/persons
// Initially was hardcoded, now connected to DB in 3.12

// ===== Middleware =====
app.use(cors())                  // 3.1 / 3.8: Enable CORS for frontend
app.use(express.json())          // 3.2: Parse JSON bodies
app.use(morgan('tiny'))          // 3.7: Log requests with Morgan 'tiny' format
app.use(express.static('dist'))  // 3.10: Serve React frontend production build

// ===== 3.12: GET all phonebook entries from MongoDB =====
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons)) // Returns all entries to frontend
    .catch(error => next(error))        // 3.15: Error handling middleware
})

// ===== 3.2: /info endpoint =====
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error)) // 3.15: Error handling middleware
})

// ===== 3.3: GET person by ID =====
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person)
      else res.status(404).end()
    })
    .catch(error => next(error)) // 3.15: Pass CastError to error handler
})

// ===== 3.4 & 3.14: DELETE person =====
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end()) // Successfully removed from DB
    .catch(error => next(error))       // 3.15: CastError handled centrally
})

// ===== 3.5 & 3.13: POST new person =====
app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  // ===== 3.6: Error handling for missing data =====
  if (!name || !number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  // 3.13: Save new person to database, ignoring duplicates for now
  const person = new Person({ name, number })

  person.save()
    .then(savedPerson => res.json(savedPerson)) // Return saved person to frontend
    .catch(error => next(error))                // 3.15: Pass errors to middleware
})

// ===== 3.15: Unknown endpoint middleware =====
app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})

// ===== 3.15: Central error handling middleware =====
app.use((error, req, res, next) => {
  console.error(error.name, error.message)

  // 3.15: Catch Mongoose CastError (invalid MongoDB ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error) // fallback to default Express error handler
})

// ===== 3.1: Start server =====
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})