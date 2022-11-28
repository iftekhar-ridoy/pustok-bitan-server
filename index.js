const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');



// middleware 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qj1nhmw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// varifyJWT 
function varifyJWT(req, res, next) {
    console.log('token inside verify', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}



async function run() {
    try {
        const categoryOptionCollention = client.db('pustokBitan').collection('categoriesCollection');
        const usersCollention = client.db('pustokBitan').collection('users');
        const bookingCollention = client.db('pustokBitan').collection('bookings');
        const addProductCollention = client.db('pustokBitan').collection('addProduct');

        // JWT 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollention.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' });
        })



        // get categories from server
        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoryOptionCollention.find(query).toArray();
            res.send(result);
        })

        //get id wise category
        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await categoryOptionCollention.findOne(query);
            res.send(result);
        })

        //get users data
        app.get('/users', async (req, res) => {
            const query = {};
            const result = await usersCollention.find(query).toArray();
            res.send(result);
        })


        //post users data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollention.insertOne(user);
            res.send(result);
        })

        //delete user data
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollention.deleteOne(query);
            res.send(result);
        })


        // admin role 
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollention.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        // buyer role 
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollention.findOne(query);
            res.send({ isBuyer: user?.role === 'Buyer' });
        })


        // seller role
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollention.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        })


        //get booking data
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const booking = await bookingCollention.find(query).toArray();
            res.send(booking);
        })

        //post booking of a book data
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollention.insertOne(booking);
            res.send(result);
        })

        //delete a booking data
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollention.deleteOne(query);
            res.send(result);
        })

        //get products data
        app.get('/addProduct', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            console.log(email);
            const addProduct = await addProductCollention.find(query).toArray();
            console.log(addProduct);
            res.send(addProduct);
        })

        //post new-product data
        app.post('/addProduct', async (req, res) => {
            const addProduct = req.body;
            const resultAddProduct = await addProductCollention.insertOne(addProduct);
            res.send(resultAddProduct);
        })



        //delete a product data
        app.delete('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addProductCollention.deleteOne(query);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(error => console.log(error));



app.get('/', async (req, res) => {
    res.send('Pustok-Bitan server is running');
})

app.listen(port, () => console.log(`portal is ruinning on ${port}`))