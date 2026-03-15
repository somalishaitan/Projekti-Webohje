const express = require('express')
const morgan = require('morgan')
const cors = require('cors')  

const app = express()

app.use(cors())   
app.use(express.json())
app.use(morgan('tiny'))

app.set('json spaces', 2)

let persons = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' }
]

const generateId = () => {
  return Math.floor(Math.random() * 1000000).toString()
}

/* GET all persons */
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

/* Info page */
app.get('/info', (req, res) => {
  const requestTime = new Date()
  const peopleCount = persons.length

  res.send(`
    <p>Phonebook has info for ${peopleCount} people</p>
    <p>${requestTime}</p>
  `)
})

/* GET single person */
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

/* DELETE person */
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

/* POST new person */
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  }

  const nameExists = persons.some(person => person.name === body.name)

  if (nameExists) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})