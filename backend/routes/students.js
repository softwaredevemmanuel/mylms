const router = require("express").Router();
const {admin, User, Tutor, Content} = require('../models/Admin')


router.post('/user-login', async (req, res) => {
    const { email, id } = req.body;
  
    try {
      const user = await User.findOne({ email, id });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      return res.json({ message: 'Logged in as user', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in' });
    }
  });

module.exports = router;
