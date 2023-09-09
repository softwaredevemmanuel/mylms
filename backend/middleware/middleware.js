const {admin, User, Tutor, Content} = require('../models/Admin')


function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== admin.password) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }



  module.exports= isAuthenticated;
