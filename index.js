require('dotenv').config()

const express = require('express')
const app = express()
const Person = require('./models/person')

const cors = require('cors')

let morgan = require('morgan')
morgan.token('req-body-do-not-do-this-irl', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body-do-not-do-this-irl'))
app.use(express.json())
app.use(express.static('build'))

/* Below is old code for when there was no database and the data was stored in a local array */
// let persons = [
//   { 
//     "id": 1,
//     "name": "Arto Hellas", 
//     "number": "040-123456"
//   },
//   { 
//     "id": 2,
//     "name": "Ada Lovelace", 
//     "number": "39-44-5323523"
//   },
//   { 
//     "id": 3,
//     "name": "Dan Abramov", 
//     "number": "12-43-234345"
//   },
//   { 
//     "id": 4,
//     "name": "Mary Poppendieck", 
//     "number": "39-23-6423122"
//   }
// ]

app.get('/', (request, response) => {
  response.send('<h3>If you can see this, then there is something wrong with the frontend build</h3>')
})

app.get('/api/info', (request, response) => {
  let numberOfPersons = 0
  Person.find({}).then(people => {
    console.log('people found using Person.find({}): ',people)
    numberOfPersons = people.length
    const responseString = `<p>Phonebook has info for ${numberOfPersons} people</p><p>${new Date()}</p>`
    response.send(responseString)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))

  /* Below is old code for when there was no database and the data was stored in a local array */
  // const id = Number(request.params.id)
  // const person = persons.find(person => person.id === id)
  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }
})


app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))

  /* Below is old code for when there was no database and the data was stored in a local array */
  // const id = Number(request.params.id)
  // persons = persons.filter(person => person.id !== id)

  // response.status(204).end()
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  /* Deprecated means of validation. Use mongoose schema validation instead. */ 
  // if (!(body.hasOwnProperty('name') && body.hasOwnProperty('name') && Object.keys(body).length === 2)) {
  //   return response.status(400).json({ error: 'invalid content' })
  // }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
  .catch(error => next(error))
  /* Below is old code for when there was no database and the data was stored in a local array */
  // // Check if name already exists in the phonebook
  // if (persons.find(element => element.name === request.body.name)) {
  //   response.status(400).json( { error: 'name must be unique' } )
  //   return
  // }

  // // Valid request iff request.body.name && request.body.number && two attributes
  // if (!(request.body.hasOwnProperty('name') && request.body.hasOwnProperty('name') && Object.keys(request.body).length === 2)) {
  //   response.status(400).end()
  // }

  // let newPerson = request.body
  // newPerson.id = Math.floor(Math.random() * 1000)
  // console.log('id generated for newPerson: ', newPerson.id)
  // while (persons.find(element => element.id === newPerson.id)) {
  //   newPerson.id = Math.floor(Math.random() * 1000)
  //   console.log('id generated for newPerson: ', newPerson.id)
  // }
  // console.log(newPerson)
  // persons.push(newPerson)
  // response.json(newPerson)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const newPerson = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, newPerson, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log('error to be handled: ', error)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})