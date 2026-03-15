// mongo.js
const mongoose = require('mongoose')

// Get command-line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.log('Usage: node mongo.js <password> [name number]')
  process.exit(1)
}

const password = args[0]

// MongoDB connection string
// Replace <db_password> with your password and specify database name 'phonebookApp'
const url = `mongodb+srv://faaahm_db_user:${password}@cluster0.dufzdaa.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')

    // Define schema and model
    const personSchema = new mongoose.Schema({
      name: String,
      number: String,
    })

    const Person = mongoose.model('Person', personSchema)

    // List all entries if only password is provided
    if (args.length === 1) {
      Person.find({})
        .then(persons => {
          console.log('phonebook:')
          persons.forEach(p => console.log(`${p.name} ${p.number}`))
          mongoose.connection.close()
        })
        .catch(err => {
          console.error(err)
          mongoose.connection.close()
        })
    } 
    // Add a new person if name and number are provided
    else if (args.length === 3) {
      const name = args[1]
      const number = args[2]

      const person = new Person({ name, number })

      person.save()
        .then(() => {
          console.log(`added ${name} number ${number} to phonebook`)
          mongoose.connection.close()
        })
        .catch(err => {
          console.error(err)
          mongoose.connection.close()
        })
    } 
    else {
      console.log('Invalid number of arguments. Provide either password OR password name number.')
      mongoose.connection.close()
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err)
  })