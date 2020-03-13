const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // to parse all data coming from the user and db
const cors = require('cors'); //to include cross origin request
const bcryptjs = require('bcryptjs'); //to hash and compare password in an encryted form
const config = require('./config.json'); //to store credentials
//const product = require('./products.json'); //external json data from mockaroo api
const Product = require('./models/products.js');
const User = require('./models/users.js');


const port = 5000;
//const port = 8080;  //run at localhost

//connect to db
// const mongodbURI = 'mongodb+srv://pearlydb:<password>@pearly-cpl-yceqt.mongodb.net/test?retryWrites=true&w=majority'
const mongodbURI = `mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/shop?retryWrites=true&w=majority`;
mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('DB connected!'))
.catch(err => {
  console.log(`DBConnectionError : ${err.message}`);
});

// test the connectivity
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('We are connected to mongo db');
});


app.use((req,res, next)=>{
  console.log(`${req.method} request for ${req.url}`);
  next(); //include this to go to the next middleware
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/allProducts',(req, res)=>{
  res.json(product);
});


app.get('/product/p=:id',(req,res)=>{
  const idParam = req.params.id;
  for (let i = 0; i < product.length; i++){
    if (idParam.toString() === product[i].id.toString()) {
      res.json(product[i]);
    }
  }
});

app.post('/registerUser', (req,res)=> {
 // checking if user is found in the db already
  User.findOne({username:req.body.username},(err, userResult)=> {
    if (userResult){
      res.send('username taken already. Please try another one');
    } else {
      const hash = bcryptjs.hashSync(req.body.password); //has the password
      const user = new User({
        _id : new mongoose.Types.ObjectId,
        username : req.body.username,
        email : req.body.email,
        password : hash
      });
      //save to database and notify the user accordingly
      user.save().then(result => {
        res.send(result);
      }).catch(err => res.send(err));
    }
  })


});

// get all user
app.get('/allUsers', (req, res)=> {
  User.find().then(result => {
    res.send(result);
  });
});


//login the user
app.post('/loginUser',(req,res) =>{
  User.findOne({username: req.body.username}, (err, userResult) =>{
    if (userResult){
      if(bcryptjs.compareSync(req.body.password, userResult.password)){
        res.send(userResult);
      } else {
        res.send('not authorized');
      } //inner if
    } else {
      res.send('user not found. Please register');
  } //outer if
}); //findOne
}); //post


// add new products
app.post('/newProduct', (req,res)=> {
 // checking if product is found in the db already
  Product.findOne({productname:req.body.productname},(err, productResult)=> {
    if (productResult){
      res.send('Product is already in database. Please try again!');
    } else {
      const shopProduct = new Product({
        _id : new mongoose.Types.ObjectId,
        productname : req.body.productname,
        price : req.body.price,
        user_id : req.body.userId
      });
      //save to database and notify the user accordingly
      shopProduct.save().then(result => {
        res.send(result);
      }).catch(err => res.send(err));
    }
  })
});


// get all products
app.get('/ProductsFromDB', (req, res)=> {
  Product.find().then(result => {
    res.send(result);
  });
});


//delete a products
app.delete('/deleteProduct/:id',(req,res) => {
  const idParam = req.params.id;
  Product.findOne({_id:idParam}, (err, product) => { //_id refers to mongodb
    if (product) {
      dbProducts.deleteOne({_id:idParam}, err => {
        res.send('deleted');
      });
    } else {
      res.send('not found');
    }
  }).catch(err => res.send(err));
});


// update products
app.patch('/updateProduct/:id',(req,res)=> {
  const idParam = req.params.id;
  Product.findById(idParam,(err,product)=> {
    const updatedProduct = {
      productname:req.body.productname,
      price : req.body.price
    };
    Product.updateOne({_id:idParam}, updatedProduct).then(result => {
      res.send(result);
    }).catch(err => res.send(err));
  }).catch(err => res.send('not found'));
});


// update user
app.patch('/updateUser/:id',(req,res)=> {
  const idParam = req.params.id;
  User.findById(idParam,(err,user)=> {
    const updatedUser = {
      username:req.body.username,
      email : req.body.email,
      password : req.body.password
    };
    User.updateOne({_id:idParam}, updatedUser).then(result => {
      res.send(result);
    }).catch(err => res.send(err));
  }).catch(err => res.send('not found'));
});



// // get product by id
// app.get('/product_id/p=:id',(req,res)=>{
//   Product.find().then(result => {
//     const idParam = req.params.id;
//     var filteredArray = [];
//     for (var i = 0; i < result.length; i++){
//       if (idParam === result[i].id.toString()) {
//         filteredArray.push(result[i]);
//       }
//     } if(filteredArray.toString() === ""){
//       res.send('Invalid parameter');
//     } else {
//       res.send(filteredArray);
//     }
//   })
//
// });




// keep this alwasy at the bottom so that you can see the errors reported
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
