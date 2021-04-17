const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port = 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.af2ol.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("cycleService").collection("services");
  const adminCollection = client.db("cycleService").collection("admin");
  const orderCollection = client.db("cycleService").collection("order");
  const reviewCollection = client.db("cycleService").collection("review");

  // add service
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    
    const newImg = file.data;
    const insertImg = newImg.toString('base64');

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(insertImg, 'base64')
    }
    serviceCollection.insertOne({image, title, price, description})
    .then(result => {
      res.send(result.insertedCount > 0);
    })

  })

  // get service
  app.get('/services', (req, res) => {
    serviceCollection.find({})
    .toArray((err, data) => {
      res.send(data);
    })

    // find specific service
    app.get('/service/:id', (req, res) => {
      const id = req.params.id;
      serviceCollection.find({_id: ObjectId(id)})
      .toArray((err, singleService) => {
        res.send(singleService[0]);
      })
    })
  })

  // add order
  app.post('/addOrder', (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  // get order
  app.get('/orders', (req, res) => {
    orderCollection.find({})
    .toArray((err, data) => {
      res.send(data);
    })
  })

  // add client review
  app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  // get review
  app.get('/review', (req, res) => {
    reviewCollection.find({})
    .toArray((err, data) => {
      res.send(data);
    })
  })

  //add admin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })

  // delete service
  app.delete('/delete/:id', (req, res) => {
    const deleteService = req.params.id;
    serviceCollection.deleteOne({_id: ObjectId(deleteService)})
    .then( result => {
      res.send(result.deletedCount > 0);
    })
  })
  
});


app.get('/', (req, res) => {
  res.send('Do you find anything!!')
})

app.listen(process.env.PORT || port);