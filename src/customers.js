
const { req, res } = require('express')
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

exports.getCustomers = (req, res) => {
    const db = connectDb()
    db.collection('customers').get()
        .then( customerCollection => {
            const allCustomers = customerCollection.docs.map(customerDoc => {
                let cust = customerDoc.data()
                cust.id = customerDoc.id
                return cust
            })
            res.send(allCustomers)
        })
        .catch(err => {
            console.error(err)
            res.status(500).send(err)
        })
}

exports.getCustomerById = (req, res) => {
    if (!req.params.customerId) {
        res.status(400).send('No customer specified!.')
        return
    }
    const db = connectDb()
    db.collection('customers').doc(req.params.customerId).get()
        .then( doc => {
            let customer = doc.data()
            customer.id = doc.id
                /* *** important to set id as property of object because firestore doesn't 
                automatically do this. so this pulls the doc id (name of object itself) and 
                assigns it as a property of the doc. */
            res.send(customer)
        })
        .catch( err => {
            console.error(err)
            res.status(500).send(err)
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
            const matches = customerCollection.docs.map( customerDoc => {
                let customer = customerDoc.data()
                customer.id = customerDoc.id
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

// filter out Dan using firestore
// exports.getCustomersNotDan = (req, res) => {
//     const db = connectDb()
//     db.collection('customers').where('firstName', '!=', 'Dan').get()
//         .then( customerCollection => {
//             const customers = customerCollection.docs.map(customerDoc => {
//                 let customer = customerDoc.data()
//                 customer.id = customerDoc.id
//                 return customer
//             })
//             res.send(customers)
//         })
//         .catch(err => {
//             console.error(err)
//             res.status(500).send(err)
//         })
// }

//filter out Dan using JS filter
// exports.getCustomersNotDan = (req, res) => {
//     const db = connectDb()
//     db.collection('customers').get()
//         .then( customerCollection => {
//             const customers = customerCollection.docs.map(customerDoc => {
//                 let customer = customerDoc.data()
//                 customer.id = customerDoc.id
//                 return customer
//             })
//             const goodCustomers = customers.filter(cust => cust.firstName !== 'Dan')
//             res.send(goodCustomers)
//         })
//         .catch(err => {
//             console.error(err)
//             res.status(500).send(err)
//         })
// }

exports.deleteCustomer = (req,res) => {
    const db = connectDb()
    const { docId } = req.params
    db.collection('customers').doc(docId).delete()
        .then( () => res.status(203).send('document successfully deleted.'))
        .catch(err => res.status(500).send(err))
}

// update customer with hard coded values
// exports.updateCustomer = (req,res) => {
//     const db = connectDb()
//     const { docId } = req.params
//     let recordToUpdate = db.collection('customers').doc(docId)
//     return recordToUpdate.update({
//         "firstName":"Christian",
//         "lastName":"Darlington",
//         "tel":"444-444-4444",
//         "dob":"1952-12-31",
//         "email":"christian@bocacode.com",
//         "pets":{
//             "age":80,
//             "name":"Buddy",
//             "size":"smallish",
//             "alive":true,
//             "type":"dog"
//         },
//     })
//         .then( () => res.status(201).send(`Customer ${docId} updated.`))
//         .catch( err => res.status(500).send(err))
// }

// update customers via request body
exports.updateCustomer = (req,res) => {
    const db = connectDb()
    const { docId } = req.params
    db.collection('customers').doc(docId).update(
        {...req.body, timestamp: admin.firestore.FieldValue.serverTimestamp()}
        )
        // THE ... IS SPREAD OPERATOR, TO BRING req.body INTO THE OBJECT, THEN ADD TO IT
        .then( () => res.status(201).send(`Customer ${docId} updated.`))
        .catch( err => res.status(500).send(err))
}