
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
    if (!request.params.id) {
        response.status(400).send('No customer specified!.')
        return
    }
    const db = connectDb()
    db.collection('customers').doc(request.params.id).get()
        .then( doc => {
            const customer = doc.data()
            customer.id = doc.id   
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

