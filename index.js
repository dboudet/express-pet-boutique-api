const express = require('express') // uses express library
const cors = require('cors')  // users cors library (cross-origin resource sharing)
const { getCustomers, getCustomerById, getCustomerByQuery, createCustomer, deleteCustomer, updateCustomer } = require('./src/customers')  // pulls in functions from source file
const app = express()  // allows us to use 'app' to call express functions
app.use(cors())  // use cors
app.use(express.json())

// app.get('/customers/notDan', getCustomersNotDan)
app.get('/customers/search', getCustomerByQuery)
app.get('/customers/:customerId', getCustomerById) // get request to call function to get customer by id
app.get('/customers', getCustomers)   // get request to call the getCustomers function when accessing the /customers route

app.post('/customers', createCustomer)

app.patch('/customers/:docId', updateCustomer)

app.delete('/customers/:docId', deleteCustomer)

app.listen(3000, () => {
    console.log("Listening to http://localhost:3000")
})