
const { request, response } = require('express')
const admin = require('firebase-admin')
const credentials = require('../credentials.json')


function connectDb() {
    if(!admin.apps.length){
        admin.initializeApp({
          credential: admin.credential.cert(credentials)
        })
    }    
    return admin.firestore()
}

exports.getCustomers = (request, response) => {
    const db = connectDb()
    db.collection('customers').get()
        .then( customerCollection => {
            const allCustomers = customerCollection.docs.map(doc => doc.data())
            response.send(allCustomers)
        })
        .catch(err => {
            console.error(err)
            response.status(500).send(err)
        })
}

exports.getCustomerById = (request, response) => {
    if (!request.params.customerId) {
        response.status(400).send('No customer specified!.')
        return
    }
    const db = connectDb()
    db.collection('customers').doc(request.params.customerId).get()
        .then( customerDoc => {
            let customer = customerDoc.data()
            customer.id = customerDoc.id
                /* *** important to set id as property of object because firestore doesn't 
                automatically do this. so this pulls the doc id (name of object itself) and 
                assigns it as a property of the doc. */
            response.send(customer)
        })
        .catch( err => {
            console.error(err)
            response.status(500).send(err)
        })
}

// return results based on query parameter (fname) in URL/path
exports.getCustomerByQuery = (req,res) => {
    //get query from req.query
    const { fname } = req.query
    // connect to firestore
    const db = connectDb()
    // search customers collection based on query
    db.collection('customers').where( 'firstName', '==', fname ).get()
    // respond with results
    .then(
        customerCollection => {
            const matches = customerCollection.docs.map( doc => {
                let customer = doc.data()
                customer.id = doc.id
                return customer
            })
            res.send(matches)
        }
        )
        .catch(err => res.status(500).send(err))
    }
    
    //create new customer with post
    exports.createCustomer = (req,res) => {
        const db = connectDb()

        db.collection('customers')
        .add(req.body)
        .then(docRef => res.send(docRef.id))
        .catch(err => res.status(500).send("Customer could not be created."))
}