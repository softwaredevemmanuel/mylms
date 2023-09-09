const router = require("express").Router();
const {admin, User, Tutor, Content} = require('../models/Admin')



async function isTutor(req, res, next) {
    const authHeader = req.headers.authorization;
  
    try {
      const tutor = await Tutor.findOne({ id: authHeader });
  
      if (!tutor) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      // Attach tutor information to the request object for use in the route handler
      req.tutor = tutor;
  
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Error checking tutor' });
    }
  }
  
  router.post('/create-content', isTutor, async (req, res) => {
    const { topic, content } = req.body;
    const tutor = req.tutor; // Tutor information attached to the request object in middleware
    // console.log(tutor)
  
    try {
      // Check if content with the provided topic already exists
      const existingContent = await Content.findOne({ topic });
  
      if (existingContent) {
        return res.status(400).json({ message: 'Topic already exists' });
      }
  
      // Create a new content with the tutor's course
      const newContent = new Content({
        topic,
        content,
        course: tutor.course // Attach tutor's course to the content
      });
  
      // Save the new content
      await newContent.save();
  
      return res.json({ message: 'Content created successfully', content: newContent });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating content' });
    }
  });



  router.post('/tutor-login', async (req, res) => {
    const { email, id } = req.body;
  
    try {
      const tutor = await Tutor.findOne({ email, id });
      if (!tutor) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      return res.json({ message: 'Logged in as tutor', tutor });
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in' });
    }
  });

  module.exports = router;
