const mongoose = require("mongoose");

const admin = {
    username: 'emma',
    password: '1234',
  };
  
  
  const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    course: String,
    id: String,
  });
  
  const tutorSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    course: String,
    phone: Number,
    id: String,
  });
  
  const contentSchema = new mongoose.Schema({
    topic: String,
    content: String,
    course: String
  });
  
    const User = mongoose.model('User', userSchema);
    const Tutor = mongoose.model('Tutor', tutorSchema);
    const Content = mongoose.model('Content', contentSchema);

  module.exports={User, Tutor, Content, admin};
