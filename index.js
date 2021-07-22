const express = require('express')
const cors = require('cors')
let morgan = require('morgan')
const app = express()

morgan.token('req-body-do-not-do-this-irl', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body-do-not-do-this-irl'))
app.use(express.json())
app.use(express.static('build'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/info', (request, response) => {
  const responseString = `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  response.send(responseString)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  console.log('POST request body: ', request.body)

  // Check if name already exists in the phonebook
  if (persons.find(element => element.name === request.body.name)) {
    response.status(400).json( { error: 'name must be unique' } )
    return
  }

  // Valid request iff request.body.name && request.body.number && two attributes
  if (!(request.body.hasOwnProperty('name') && request.body.hasOwnProperty('name') && Object.keys(request.body).length === 2)) {
    response.status(400).end()
  }

  let newPerson = request.body
  newPerson.id = Math.floor(Math.random() * 1000)
  console.log('id generated for newPerson: ', newPerson.id)
  while (persons.find(element => element.id === newPerson.id)) {
    newPerson.id = Math.floor(Math.random() * 1000)
    console.log('id generated for newPerson: ', newPerson.id)
  }
  console.log(newPerson)
  persons.push(newPerson)
  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})