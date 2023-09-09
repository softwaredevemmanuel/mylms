const router = require("express").Router();
const {admin, User, Tutor, Content} = require('../models/Admin')
const isAuthenticated = require("../middleware/middleware")
const shortid = require('shortid');




router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (username === admin.username && password === admin.password) {
      return res.json({ message: 'Logged in as admin' });
    }
  
    return res.status(401).json({ message: 'Invalid credentials' });
  });
  

  router.post('/create-user', isAuthenticated, async (req, res) => {
    const { first_name, last_name, email, course } = req.body;
  
    try {

      // Check if a user with the provided email already exists
      const existingUser = await User.findOne({ email });

  
      if (existingUser) {
        return res.status(400).json({ message: 'User with email already exists' });
      }

  
      // Generate a unique ID based on email and name
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;

      // Create a new user
      const newUser = new User({
        first_name,
        last_name,
        email,
        course,
        id, 
      });
  
      // Save the new user
      await newUser.save();
  
      return res.json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating user' });
    }
  });



router.post('/create-tutor', isAuthenticated, async (req, res) => {
  const { first_name, last_name, email, course, phone } = req.body;

  try {
    // Check if a user with the provided email already exists
    const existingUser = await Tutor.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User with email already exists' });
    }

    // Generate a unique ID based on email and name
    const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;

    // Create a new user
    const newTutor = new Tutor({
      first_name,
      last_name,
      email,
      course,
      phone,
      id, 
    });

    // Save the new user
    await newTutor.save();

    return res.json({ message: 'User created successfully', tutor: newTutor });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user' });
  }
});




  module.exports = router;

