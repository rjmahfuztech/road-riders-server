const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
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
  })

  //add admin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })
  
});


app.get('/', (req, res) => {
  res.send('Dy you find anything!!')
})

app.listen(process.env.PORT || port);