const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const cors = require('cors');





const app = express();
const PORT = process.env.PORT || 5000;

// ............................. Jsonwebtoken section ...........................
const createToken = (_id) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "3d" });

};
// ..............................................................................

app.use(cors());
app.use(bodyParser.json());



// .................................................................................
const users = [
  {"email":"email1@gmail.com", "username": "emma", "id":111, "password": "1234"},
  {"email":"email2@gmail.com", "username": "hannah", "id":222, "password": "1234"},
  {"email":"email3@gmail.com", "username": "caleb", "id":333, "password": "1234"},

]
app.get('/api', (req, res) => {
  res.json({
    message: "Hello this is the first route"
  })
})


app.post('/api/login', (req, res)=>{
  console.log('req data', req.body.password, req.body.email)
  users.filter(user =>{
    if(user.email == req.body.email){
      if(user.password == req.body.password){
        console.log(user)
        const payload={
          id: user.id,
        }
        jwt.sign(payload, 'shhh', {expiresIn: '10h'}, (err, token)=>{
          res.json({
            token:token
          })
        })
      }
    }
  })
})

function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization;

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).json({ message: 'Token failed' });
  }
}



app.post('/api/posts', verifyToken, (req, res)=>{

  jwt.verify(req.token, 'shhh', (err, authData)=>{
    if(err){
      res.sendStatus(403).json({message:"post failed"})
    }else{
      res.json({
        message:"blog posted",
        authData:authData 
      })
    }
  })
})


// .......................................................................................


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
