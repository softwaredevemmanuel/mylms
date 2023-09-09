const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require('cors');

const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();




const options ={
  definition: {
    openapi : "3.0.1",
    info:{
      title:"EhizuaHub Upskill LMS API Documentation",
      description :"This is the documentation for Ehizuahub upskill lms api.",
      version:'v2',
    },
    servers:[
      {
        url:`http://localhost:${process.env.PORT}`,
      }
    ]
  },
  apis:['./app.js']
}

const swaggerSpec = swaggerJSDoc(options)
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.use(cors());
app.use(bodyParser.json());

const connectDB = async () => {
  try {
      await mongoose.connect('mongodb+srv://blog:blog@blogcluster.kod6w.mongodb.net/?retryWrites=true&w=majority',
          {
              useNewUrlParser: true,
              useUnifiedTopology: true,
          })
          
      console.log('Mongo Connected now');
  } catch (err) {
      console.error(err.message)
      process.exit(1)
  }
}
connectDB()




const studentSchema = new mongoose.Schema(
 
  { 
    first_name : String,
    last_name : String,
    email: String,
    course: String,
    phone : Number,
    guardiansPhone : Number,
    duration: String,
    courseFee: Number,
    amountPaid: Number,
    balance: Number,
    homeAddress: String,
    id: String,
    isVerified: {type: Boolean, default: false},
    emailToken: String,
  },
  {
    timestamps: true,
  }
);

const tutorSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  course: String,
  phone: Number,
  id: String,
  password: String,
  emailToken: String,
  isVerified: {type: Boolean, default: false},



});

const contentSchema = new mongoose.Schema({
  topic: String,
  content: String,
  course: String
});

const questionSchema = new mongoose.Schema({
  topic: String,
  question: String,
  course: String,
  ans1: String,
  ans2: String,
  ans3: String,
  ans4: String,
  ans5: String,
  correctAns: String
});

const submitedQuestionSchema = new mongoose.Schema(
  {
    topic: String,
    question: String,
    course: String,
    ans: String,
    email: String,
    isPass: {type: Boolean, default: false},

},
{
  timestamps: true,
});


const percentageScoreSchema = new mongoose.Schema(
  {
    topic: String,
    course: String,
    email: String,
    score: Number,
    isPassed: {type: Boolean, default: false},

},
{
  timestamps: true,
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String
});


const Student = mongoose.model('Student', studentSchema);
const Tutor = mongoose.model('Tutor', tutorSchema);
const Content = mongoose.model('Content', contentSchema);
const Question = mongoose.model('Question', questionSchema);
const SubmitedQuestion = mongoose.model('SubmitedQuestion', submitedQuestionSchema);
const Percentage = mongoose.model("Percentage",percentageScoreSchema);
const AdminAuthorization = mongoose.model("AdminAuthorization",adminSchema)



// Middleware to check if a Student is authenticated
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authheader;
  if (!authHeader || authHeader !== admin.password) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

  //....... JSON WEB TOKEN ............
const createToken = (payload) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  return jwt.sign(payload, jwtSecretKey, { expiresIn: "3d" });
};
  
/**
 * @swagger
 * /:
 *   get:
 *     summary: Hello World
 *     description: Returns a simple "Hello from node" message.
 *     responses:
 *       '200':
 *         description: Successful response.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>Hello from node</h1>"
 */


app.get('/', function(req, res){
  res.send("<h1>Hello from node</h1>");
});

app.get('/user', async (req, res) => {
  const user = await AdminAuthorization.findOne({email:'admin@gmail.com'})
  res.send(user);
});
// ................................  ADMIN LOGIN .................................
/**
 * @swagger
 * components:
 *   schemas:
 *     AdminAuthorization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as an admin
 *     description: Authenticate and log in as an admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin's email.
 *               password:
 *                 type: string
 *                 description: Admin's password.
 *     responses:
 *       '200':
 *         description: Successful login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 admin_authorization:
 *                   $ref: '#/components/schemas/AdminAuthorization'  # Define the AdminAuthorization schema
 *       '401':
 *         description: Unauthorized login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await AdminAuthorization.findOne({ email });

      
      if (admin && admin.password === password) {
        const payload = { id: admin._id }; // Modify the payload format if needed
  

        // .........Call the JWT function .............
        const token = createToken(payload);
        
        res.json({ token: token, admin_authorization: payload});

      } else {
        res.status(401).json({ message: 'Wrong Email or Password' });
      }
    } catch (error) {
      res.status(500).json({ message: `Error: ${error.message}` });
    }
  });

  // ..................................ADMIN CREATE STUDENT/ Send email ..........................

/**
 * @swagger
 * /api/auth/create-student:
 *   post:
 *     summary: Admin Register a new student
 *     description: Create a new student account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: First name of the student.
 *               last_name:
 *                 type: string
 *                 description: Last name of the student.
 *               email:
 *                 type: string
 *                 description: Email of the student.
 *               course:
 *                 type: string
 *                 description: Course of the student.
 *               phone:
 *                 type: string
 *                 description: Phone number of the student.
 *               guardiansPhone:
 *                 type: string
 *                 description: Phone number of the student's guardian.
 *               duration:
 *                 type: string
 *                 description: Duration of the course.
 *               courseFee:
 *                 type: number
 *                 description: Total course fee.
 *               amountPaid:
 *                 type: number
 *                 description: Amount already paid.
 *               homeAddress:
 *                 type: string
 *                 description: Home address of the student.
 *     responses:
 *       '200':
 *         description: Successful student creation response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 student:
 *                   $ref: '#/components/schemas/Student'  # Define the Student schema
 *       '400':
 *         description: Bad request response when a student with the same email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.post('/api/auth/create-student', async (req, res) => {

  const { first_name, last_name, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, homeAddress } = req.body;  

  try {
    const salt = await bcrypt.genSalt(10);

    // Check if a student with the provided email already exists
    const existingUser = await Student.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Student with email already exists' });
    }

    // Generate a unique ID based on email and name
    const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
    const hashedPass = await bcrypt.hash(id, salt);

    total = courseFee - amountPaid
    let balance = total
    let emailToken = crypto.randomBytes(64).toString("hex")

    // Create a new Student
    const newUser = new Student({
      first_name,
      last_name,
      email,
      course,
      phone,
      guardiansPhone,
      duration,
      courseFee,
      amountPaid,
      balance,
      homeAddress,
      id: hashedPass,
      emailToken
    });

console.log(id)

await newUser.save();

    const transporter = nodemailer.createTransport({
      host: 'mail.softwaredevemma.ng',
      port: 465,
      secure: true,
      auth:{
          user: 'main@softwaredevemma.ng',
          pass: 'bYFx.1zDu968O.'
      }

    });

    const info = await transporter.sendMail({
      from: 'Ehizua Hub <main@softwaredevemma.ng>',
      to: newUser.email,
      subject: 'Login Details',
      html: `<p>Hello ${newUser.first_name} ${newUser.last_name} , verify your email by clicking on this link.. </p>
      <a href='${process.env.CLIENT_URL}/verify-student-email?emailToken=${newUser.emailToken}&email=${newUser.email}'> Verify Your Email </a>
      
        <h2>Your Subsequent Student Log in details are : </h2>
        <p> Email: ${newUser.email} </p>
        <p> Password: ${password} </p>`,
      
  })

  console.log("message sent: " + info.messageId);




    return res.json({ message: 'Student created successfully', user: newUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating Student' });
  }
});

// .......................... STUDENT VERIFICATION EMAIL ..................................

/**
 * @swagger
 * /api/auth/verify-student-email:
 *   post:
 *     summary: Verify Student Email
 *     description: Verify a student's email address using the provided email token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailToken:
 *                 type: string
 *                 description: Email verification token sent to the student's email.
 *               email:
 *                 type: string
 *                 description: Student's email for verification.
 *     responses:
 *       '200':
 *         description: Successful email verification response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Success message.
 *       '404':
 *         description: Not found response when invalid email token or already verified email.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 */

app.post('/api/auth/verify-student-email', async (req, res) => {
  try {
    const {emailToken, email} = req.body;

    if (!emailToken) {
      return res.status(404).json("EmailToken not found...");
    }
    
    const user = await Student.findOne({ emailToken });
    const user_email = await Student.findOne({ email });

    if(user_email.isVerified == true){

      return res.status(404).json("Email has already been verified..");

    }
  
    if (emailToken != user_email.emailToken && user_email.emailToken !== null) {
      return res.status(404).json("Invalid Email Token...Please check your mail for verified token");
    }
  
  
   
    else if (user_email.emailToken == null && user_email.isVerified == false) {
      return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin..");
    }

    else if (user) {
      user.emailToken = null;
      user.isVerified = true;

      await user.save();

      res.status(200).json(`Your Email (${user.email}) has been verified successfully. `);
    } else {
      res.status(404).json("Email Verification failed, invalid token");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

  // ................................. STUDENT LOGIN ...........................................

/**
 * @swagger
 * /api/students/student-login:
 *   post:
 *     summary: Login as a Student
 *     description: Login with credentials (email and password) sent to your email MAKE SURE YOU HAVE VERIFIED THE EMAIL FROM THE LINK SENT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Student's email.
 *               id:
 *                 type: string
 *                 description: Student's unique ID.
 *     responses:
 *       '200':
 *         description: Successful login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                 user:
 *                   type: string
 *                   description: Student's full name.
 *                 authHeader:
 *                   type: string
 *                   description: Student's authentication header.
 *                 course:
 *                   type: string
 *                   description: Student's course.
 *       '401':
 *         description: Unauthorized login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden response when the user's account is not verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.post('/api/students/student-login', async (req, res) => {
  const { email, id } = req.body;

  try {
    const user = await Student.findOne({ email });
    const name = (`${user.first_name} ${user.last_name}`);
    const course = (user.course);



    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validated = await bcrypt.compare(id, user.id);

    if (!validated) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({message: "Please verify your account.. Or contact Ehizua Hub Admin for assistance"});
    }

    const payload = { id: user._id };
    const token = createToken(payload);

    res.json({ token: token, user: name, authHeader : user.id, course : course});
  } catch (error) {
    return res.status(500).json({ message: 'Invalid credentials' });
  }
});

// ...........................STUDENT FORGET PASSWORD ..........................

/**
 * @swagger
 * /api/auth/student_forgot_password:
 *   post:
 *     summary: Reset Student Password
 *     description: Reset a student's password and send them the new password via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Student's email for password reset.
 *     responses:
 *       '200':
 *         description: Successful password reset response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Success message.
 *       '401':
 *         description: Unauthorized response when no user with the provided email is found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 */

app.post('/api/auth/student_forgot_password', async (req, res) => {
  const { email } = req.body;
  console.log(email)
  try{
    const student = await Student.findOne({'email':email})
    if(!student){
      return res.status(401).json('No Student with Email found')
      }

      first_name = student.first_name
      last_name = student.last_name
      const salt = await bcrypt.genSalt(10);
       // Generate a unique ID based on email and name
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);
      console.log(id)

      // Update the hashed password in Mongodb with hashedPass
      await Student.updateOne({"email":email},{$set:{id:hashedPass}})

      // ..........Send Email to Tutor ............
      const transporter = nodemailer.createTransport({
        host: 'mail.softwaredevemma.ng',
        port: 465,
        secure: true,
        auth:{
            user: 'main@softwaredevemma.ng',
            pass: 'bYFx.1zDu968O.'
        }

      });
    const info = await transporter.sendMail({
      from: 'Ehizua Hub <main@softwaredevemma.ng>',
      to: email,
      subject: 'Password Reset',
      html: `<p>Hello ${first_name} ${last_name} your student password has been reset successfully

        <h2>Your New Log in details are : </h2>
        <p> Email: ${email} </p>
        <p> Password: ${id} </p>`,

    })
      console.log("message sent: " + info.messageId);


      res.status(200).json(`Password has been sent to ${email}. `);

    }catch{
      return res.json('Something went wrong')
    }

})



// .................................... STUDENT COURSE CONTENT ..........................................
/**
 * @swagger
 * components:
 *   schemas:
 *     Content:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         topic:
 *           type: string
 *         content:
 *           type: string
 *         course:
 *           type: string
 */
/**
 * @swagger
 * /api/student-course-content:
 *   get:
 *     summary: Student Course Content
 *     description: Retrieve course content for an authenticated student based on their user ID.
 *     parameters:
 *       - in: header
 *         name: authheader
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication header containing the user ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved course content.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       403:
 *         description: The user is not verified or needs to verify their account.
 *         content:
 *           text/plain:
 *             example: Please verify your account.. Or contact Ehizua Hub Admin for assistance
 *       500:
 *         description: An error occurred while retrieving course content.
 *         content:
 *           application/json:
 *             example:
 *               message: Unauthorized!! Please login to view courses
 */
app.get('/api/student-course-content', async (req, res) => {
  const authHeader = req.headers.authheader;
    console.log(authHeader)


  try {
    const authUser = await Student.findOne({ id: authHeader });

    if (authUser && authUser.email) {
      if (authUser.isVerified === false) {
        return res.status(403).send("Please verify your account.. Or contact Ehizua Hub Admin for assistance");
      }

      const course = authUser.course;
      const content = await Content.find({ course });

      return res.status(200).json({ content });
    } else {
      return res.status(500).json({ message: 'Unauthorized!! Please login to view courses' });
    }
  } catch (error) {
    console.error('Error retrieving course content:', error);
    return res.status(500).json({ message: 'An error occurred while retrieving course content' });
  }
});


// .................................... GET QUESTIONS ..........................................
/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         topic:
 *           type: string
 *         question:
 *           type: string
 *         course:
 *           type: string
 *         ans1:
 *           type: string
 *         ans2:
 *           type: string
 *         ans3:
 *           type: string
 *         ans4:
 *           type: string
 *         correctAns:
 *           type: string
 */
/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get questions for a topic and course
 *     description: Retrieve questions for a specific topic and course.
 *     parameters:
 *       - in: header
 *         name: authheader
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication header.
 *       - in: header
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic for the questions.
 *       - in: header
 *         name: course
 *         required: true
 *         schema:
 *           type: string
 *         description: Course for the questions.
 *       - in: header
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User's email for tracking last submission date.
 *     responses:
 *       '200':
 *         description: Successful response with questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 questions:
 *                   $ref: '#/components/schemas/Question'  # Define the Question schema
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.get('/api/questions', async (req, res) => {

  const authHeader = req.headers.authheader;
  const topic = req.headers.topic;
  const course = req.headers.course;
  const email = req.headers.email;

  const authUser = await Student.findOne({id:authHeader});

  const authTopic = await Question.find({topic, course});


  const lastSubmitDate = await Percentage.findOne({topic, course, email})
  if(lastSubmitDate){

  

  //  .................................For 6 hours wait........................................................
  //   const currentTime = Date.now();
  //   const submissionTime = lastSubmitDate.createdAt;
  //   const timeDifference = currentTime - submissionTime;
  //   const sixHoursInMillis = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  //   const timeLeftInMillis = sixHoursInMillis - timeDifference;
  //   const hoursLeft = Math.floor(timeLeftInMillis / (60 * 60 * 1000));
  //   const minutesLeft = Math.ceil((timeLeftInMillis - hoursLeft * 60 * 60 * 1000) / (60 * 1000));
  //   const secondsLeft = Math.floor((timeLeftInMillis % (60 * 1000)) / 1000);

  //   const timeLeftMessage = `${hoursLeft} hrs ${minutesLeft} min ${secondsLeft}sec`;

  // if (timeDifference > sixHoursInMillis) {
  // .................................For 1 minute wait ..................................................
    const currentTime = Date.now();
    const submissionTime = lastSubmitDate.updatedAt;
    const timeDifference = currentTime - submissionTime;
    const oneMinuteInMillis = 1 * 60 * 1000; // 1 minute in milliseconds
  
    const timeLeftInMillis = oneMinuteInMillis - timeDifference;
    const minutesLeft = Math.floor(timeLeftInMillis / (60 * 1000));
    const secondsLeft = Math.ceil((timeLeftInMillis - minutesLeft * 60 * 1000) / 1000);
  
    const timeLeftMessage = `${minutesLeft} min ${secondsLeft} sec`;
  
  
    if (timeDifference > oneMinuteInMillis) {
    // .................................................................................
   
          if(authUser && authUser.course == course){
              return res.json({ message: `${topic} Questions`, questions: authTopic, });
            
          }else{
            return res.status(500).json({ message: 'Invalid user token' });
          }

    }else{
      return res.status(500).json({ message: `Retake this test in ${timeLeftMessage}.` });

    }
  }else{
       
        if(authUser && authUser.course == course){
            return res.json({ message: `${topic} Questions`, questions: authTopic, });
          
        }else{
          return res.status(500).json({ message: 'Invalid user token' });
        }
      
    }
});



// ....................................SubmitedQuestion Students Question..........................................

/**
 * @swagger
 * /api/student/questions:
 *   post:
 *     summary: Submit answers to questions
 *     description: Submit answers to a set of questions for a student.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 topic:
 *                   type: string
 *                 course:
 *                   type: string
 *                 question:
 *                   type: string
 *                 ans:
 *                   type: string
 *                 email:
 *                   type: string
 *                 isPass:
 *                   type: boolean
 *                 createdAt:
 *                   type: date
 *                 updatedAt:
 *                   type: date
 *     responses:
 *       '201':
 *         description: Questions submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubmittedQuestion'  # Define the SubmittedQuestion schema
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.post('/api/student/questions', async (req, res) => {

  const questionsArray = req.body; // Array of question objects
  
  try {
    const submittedQuestions = [];

    for (const { topic, course, question, ans, email } of questionsArray) {

      const existingSubmission = await SubmitedQuestion.findOne({ topic, course, email, question });

      if (existingSubmission) {
        // Update the existing submission's ans field
        existingSubmission.ans = ans;
        await existingSubmission.save();
        submittedQuestions.push(existingSubmission);
      }else{
          const newContent = new SubmitedQuestion({
          topic,
          question,
          course,
          ans,
          email
        });
    

        // Save the new content
        await newContent.save();
        submittedQuestions.push(newContent);

      }
    
    }
  

    return res.json({ message: 'Questions submitted successfully', answers: submittedQuestions });
  } catch (error) {
    return res.status(500).json({ message: 'Error submitting questions' });
  }
});





// .................................... Get Test Score ..........................................
/**
 * @swagger
 * components:
 *   schemas:
 *     Percentage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         course:
 *           type: string
 *         email:
 *           type: string
 *         topic:
 *           type: string
 *         createdAt:
 *           type: string
 *         isPassed:
 *           type: string
 *         score:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SubmitedQuestion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         topic:
 *           type: string
 *         question:
 *           type: string
 *         course:
 *           type: string
 *         ans:
 *           type: string
 *         email:
 *           type: string
 *         isPass:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */


/**
 * @swagger
 * /api/check_test_score:
 *   get:
 *     summary: Check test score and percentage
 *     description: Check the test score and percentage for a student's test.
 *     parameters:
 *       - in: header
 *         name: authheader
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication header.
 *       - in: header
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic of the test.
 *       - in: header
 *         name: course
 *         required: true
 *         schema:
 *           type: string
 *         description: Course of the test.
 *       - in: header
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Student's email.
 *     responses:
 *       '200':
 *         description: Successful response with test score and percentage.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedPercentage:
 *                   $ref: '#/components/schemas/Percentage'  # Define the Percentage schema
 *                 Details:
 *                   type: string
 *                 correction:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SubmitedQuestion'  # Define the SubmittedQuestion schema
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/api/check_test_score', async (req, res) => {
  // const {topic, course, email} = req.body
  // const authHeader = req.headers.authorization;
  const authHeader = req.headers.authheader;
  const topic = req.headers.topic;
  const course = req.headers.course;
  const email = req.headers.email;


  const authUser = await Student.findOne({id:authHeader})
  if (!authUser){
    return res.status(500).json({ message: 'Not a  Student' });
  }
  if(authUser.course != course){
    return res.status(500).json({ message: `You are not a ${course} student` });
  }
  
  if(authUser.email != email && authUser.course == course){
    return res.status(500).json({ message: `${authUser.first_name} ${authUser.last_name} You are not authorised to view ${email} Test result` });
  }
  
 
  const authTopic = await SubmitedQuestion.find({topic, course, email});

  const authAns = await Question.find({topic, course});

  const persent = await Percentage.find({topic, course, email});

 

  let score = 0;

  for (let i = 0; i < authTopic.length; i++) {
    if (
      authTopic[i]['question'] === authAns[i]['question'] &&
      authTopic[i]['ans'] === authAns[i]['correctAns']
    ) {
      score += 1;
      await SubmitedQuestion.updateOne(
        {
          topic: authTopic[i]['topic'],
          course: authTopic[i]['course'],
          question: authTopic[i]['question'],
        },
        { $set: { isPass: true } }
      );
    }else{
      await SubmitedQuestion.updateOne(
        {
          topic: authTopic[i]['topic'],
          course: authTopic[i]['course'],
          question: authTopic[i]['question'],
        },
        { $set: { isPass: false } }
      );
    }
  }


const cal = (score / authTopic.length) * 100;
const percentageScore = cal.toFixed(1);


let myPercent = parseFloat(percentageScore) >= 70;

const updateQuery = {
  topic,
  course,
  email,
};

const updateFields = {
  $set: {
    score: percentageScore,
    isPassed: myPercent
  }
};

const options = {
  upsert: true, // Creates a new document if no match is found
  new: true // Returns the updated document
};

try {
  const updatedPercentage = await Percentage.findOneAndUpdate(updateQuery, updateFields, options);
  return res.json({ message: 'Percentage updated or created successfully', updatedPercentage, Details:`You got ${score} out of  ${authTopic.length} `, correction : authTopic  });
} catch (error) {
  return res.status(500).json({ message: 'Error updating or creating percentage' });
}



});



  // ............................ADMIN CREATE TUTOR ............................

  /**
 * @swagger
 * /api/auth/create-tutor:
 *   post:
 *     summary: Create a new tutor
 *     description: Create a new tutor account and send login details via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: First name of the tutor.
 *               last_name:
 *                 type: string
 *                 description: Last name of the tutor.
 *               email:
 *                 type: string
 *                 description: Email of the tutor.
 *               course:
 *                 type: string
 *                 description: Course of the tutor.
 *               phone:
 *                 type: string
 *                 description: Phone number of the tutor.
 *     responses:
 *       '200':
 *         description: Successful tutor creation response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tutor:
 *                   $ref: '#/components/schemas/Tutor'  # Define the Tutor schema
 *       '400':
 *         description: Bad request response when a tutor with the same email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

  app.post('/api/auth/create-tutor', async (req, res) => {
    const { first_name, last_name, email, course, phone } = req.body;
  
    try {
      const salt = await bcrypt.genSalt(10);
  
      // Check if a user with the provided email already exists
      const existingUser = await Tutor.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'Tutor with email already exists' });
      }
  
      // Generate a unique ID based on email and name
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);
      const password = id

  
  
      // Create a new user
      const newTutor = new Tutor({
        first_name,
        last_name,
        email,
        course,
        phone,
        id:hashedPass,
        emailToken:crypto.randomBytes(64).toString("hex")

      });
  

      // ..........Send Email to Tutor ............
            const transporter = nodemailer.createTransport({
              host: 'mail.softwaredevemma.ng',
              port: 465,
              secure: true,
              auth:{
                  user: 'main@softwaredevemma.ng',
                  pass: 'bYFx.1zDu968O.'
              }

            });

          const info = await transporter.sendMail({
            from: 'Ehizua Hub <main@softwaredevemma.ng>',
            to: newTutor.email,
            subject: 'Login Details',
            html: `<p>Hello ${newTutor.first_name} ${newTutor.last_name} , verify your email by clicking on this link.. </p>
            <a href='${process.env.CLIENT_URL}/verify-email?emailToken=${newTutor.emailToken}&email=${newTutor.email}'> Verify Your Email </a>
            
              <h2>Your Subsequent Tutor Log in details are : </h2>
              <p> Email: ${newTutor.email} </p>
              <p> Password: ${password} </p>`,
     
          })
          console.log("message sent: " + info.messageId);
          // ...................End of Send Mail To New User.......................................
      await newTutor.save();

      return res.json({ message: `Tutor created successfully! Log in details has been sent to ${newTutor.email} `, tutor: newTutor });

    } catch (error) {
      return res.status(500).json({ message: 'Error creating user' });
    }
  });



  // ..........................TUTOR  VERIFICATION EMAIL ..................................
/**
 * @swagger
 * /api/auth/verify-tutor-email:
 *   post:
 *     summary: Verify Tutor Email
 *     description: Verify a tutor's email address using the provided email token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailToken:
 *                 type: string
 *                 description: Email verification token sent to the tutor's email.
 *               email:
 *                 type: string
 *                 description: Tutor's email for verification.
 *     responses:
 *       '200':
 *         description: Successful email verification response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Success message.
 *       '404':
 *         description: Not found response when invalid email token or already verified email.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 */

app.post('/api/auth/verify-tutor-email', async (req, res) => {
  try {
    const {emailToken, email} = req.body;

    if (!emailToken) {
      return res.status(404).json("EmailToken not found...");
    }
    
    const user = await Tutor.findOne({ emailToken });
    const user_email = await Tutor.findOne({ email });

    if(user_email.isVerified == true){

      return res.status(404).json("Email has already been verified..");

    }
  
    if (emailToken != user_email.emailToken && user_email.emailToken !== null) {
      return res.status(404).json("Invalid Email Token...Please check your mail for verified token");
    }
  
  
   
    else if (user_email.emailToken == null && user_email.isVerified == false) {
      return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin..");
    }

    else if (user) {
      user.emailToken = null;
      user.isVerified = true;

      await user.save();

      res.status(200).json(`Your Email (${user.email}) has been verified successfully. `);
    } else {
      res.status(404).json("Email Verification failed, invalid token");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});




// .............................. TUTOR LOGIN ....................................
/**
 * @swagger
 * /api/tutor/tutor-login:
 *   post:
 *     summary: Tutor login
 *     description: Login with credentials (email and password) sent to your email MAKE SURE YOU HAVE VERIFIED THE EMAIL FROM THE LINK SENT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Tutor's email.
 *               id:
 *                 type: string
 *                 description: Tutor's unique ID.
 *     responses:
 *       '200':
 *         description: Successful login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                 tutor:
 *                   type: string
 *                   description: Tutor's full name.
 *                 tutor_authorization:
 *                   type: string
 *                   description: Tutor's authentication header.
 *                 course:
 *                   type: string
 *                   description: Tutor's course.
 *       '401':
 *         description: Unauthorized login response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.post('/api/tutor/tutor-login', async (req, res) => {
  const { email, id } = req.body;

  try {
    
    const tutor = await Tutor.findOne({ email});
    const name = (`${tutor.first_name} ${tutor.last_name}`);

    if(tutor){

    }else{
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const validated = await bcrypt.compare(id, tutor.id);

    if (!tutor || !validated) {
    
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    if (!tutor.isVerified) {
      return res.status(500).json({error: "Please verify your account.. Or contact Ehizua Hub Admin for assistance"});
    }

    const payload = { id: tutor.id };
    const token = createToken(payload);
    const tutor_course = tutor.course;
    return res.json({ message: 'Logged in as tutor', token:token, tutor : name, tutor_authorization: payload, course:tutor_course });

  } catch (error) {
    return res.status(500).json({ message: 'Error logging in' });
  }
});



async function isTutor(req, res, next) {
  const authHeader = req.headers.authheader;
  

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


// ...........................TUTOR FORGET PASSWORD ..........................
/**
 * @swagger
 * /api/auth/tutor_forgot_password:
 *   post:
 *     summary: Reset Tutor Password
 *     description: Reset a tutor's password and send them the new password via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Tutor's email for password reset.
 *     responses:
 *       '200':
 *         description: Successful password reset response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Success message.
 *       '401':
 *         description: Unauthorized response when no tutor with the provided email is found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 */

app.post('/api/auth/tutor_forgot_password', async (req, res) => {
  const { email } = req.body;
  try{
    const tutor = await Tutor.findOne({'email':email})
    if(!tutor){
      return res.status(401).json('No Tutor with Email found')
      }

      first_name = tutor.first_name
      last_name = tutor.last_name
      const salt = await bcrypt.genSalt(10);
       // Generate a unique ID based on email and name
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);
      console.log(id)

      // Update the hashed password in Mongodb with hashedPass
      await Tutor.updateOne({"email":email},{$set:{id:hashedPass}})

      // ..........Send Email to Tutor ............
      const transporter = nodemailer.createTransport({
        host: 'mail.softwaredevemma.ng',
        port: 465,
        secure: true,
        auth:{
            user: 'main@softwaredevemma.ng',
            pass: 'bYFx.1zDu968O.'
        }

      });
    const info = await transporter.sendMail({
      from: 'Ehizua Hub <main@softwaredevemma.ng>',
      to: email,
      subject: 'Password Reset',
      html: `<p>Hello ${first_name} ${last_name} your tutor password has been reset successfully

        <h2>Your New Log in details are : </h2>
        <p> Email: ${email} </p>
        <p> Password: ${id} </p>`,

    })
      console.log("message sent: " + info.messageId);


      res.status(200).json(`Password has been sent to ${email}. `);

    }catch{
      return res.json('Something went wrong')
    }

})


// ............................. TUTOR CREATE CONTENT .................................

/**
 * @swagger
 * /api/tutor/create-content:
 *   post:
 *     summary: Tutor Create Scheme of work (CONTENT)
 *     description: Create content for a tutor's course.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *                 description: Topic of the content.
 *               content:
 *                 type: string
 *                 description: Content text or details.
 *               course:
 *                 type: string
 *                 description: Course of the tutor.
 *     responses:
 *       '200':
 *         description: Successful content creation response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 content:
 *                   $ref: '#/components/schemas/Content'  # Define the Content schema
 *       '400':
 *         description: Bad request response when content with the same topic already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.post('/api/tutor/create-content', async (req, res) => {
  const { topic, content, course } = req.body;

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
      course: course // Attach tutor's course to the content
    });

    // Save the new content
    await newContent.save();

    return res.json({ message: 'Content created successfully', content: newContent });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating content' });
  }
});





// .................................... TUTOR GET COURSE CONTENT ..........................................
/**
 * @swagger
 * /api/tutor-course-content:
 *   get:
 *     summary: Get tutor course content
 *     description: Retrieve course content for the authenticated tutor.
 *     parameters:
 *       - in: header
 *         name: authheader
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication header.
 *     responses:
 *       '200':
 *         description: Successful response with course content.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'  # Define the Content schema
 *       '403':
 *         description: Unauthorized response.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/api/tutor-course-content', async (req, res) => {
  const authHeader = req.headers.authheader;

  try {
    const authUser = await Tutor.findOne({id:authHeader});
    if(authUser.email){
      if(authUser.isVerified == false){
        return res.status(403).send("Please verify your account.. Or contact Ehizua Hub Admin for assistance");
      }

      const course = authUser.course
      const content = await Content.find({course})

      return res.json({content});
    }
    
  } catch (error) {
    return res.status(500).json({ message: 'Unauthorized!! Please login to view courses' });
  }
});



// .................................... GET TUTOR STUDENTS ..........................................
/**
 * @swagger
 * /api/tutor-students:
 *   get:
 *     summary: Get tutor students
 *     description: Retrieve students for the authenticated tutor.
 *     parameters:
 *       - in: header
 *         name: authheader
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication header.
 *     responses:
 *       '200':
 *         description: Successful response with students.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'  # Define the Student schema
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/api/tutor-students', async (req, res) => {

  const authHeader = req.headers.authheader;
  
  try {
    const authUser = await Tutor.findOne({id:authHeader});

    if(authUser.email){

      const course = authUser.course
      const students = await Student.find({course})

      return res.json({students});
    }
    
  } catch (error) {
    return res.status(500).json({ message: 'Unauthorized!! Please login to view students' });
  }
});


// ....................................TUTOR CREATE QUESTION..........................................

/**
 * @swagger
 * /api/tutor/create-questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question for a tutor's course.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               course:
 *                 type: string
 *                 description: The course for which the question is created.
 *               topic:
 *                 type: string
 *                 description: The topic of the question.
 *               question:
 *                 type: string
 *                 description: The question text.
 *               ans1:
 *                 type: string
 *                 description: The first answer option.
 *               ans2:
 *                 type: string
 *                 description: The second answer option.
 *               ans3:
 *                 type: string
 *                 description: The third answer option.
 *               ans4:
 *                 type: string
 *                 description: The fourth answer option.
 *               correctAns:
 *                 type: string
 *                 description: The correct answer option (e.g., "ans1").
 *     responses:
 *       '201':
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 question:
 *                   $ref: '#/components/schemas/Question'  # Define the Question schema
 *       '500':
 *         description: Internal server error response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

app.post('/api/tutor/create-questions',  async (req, res) => {
  const { course, topic, question, ans1, ans2, ans3, ans4, correctAns, } = req.body;
  

  try {

    // Create a new content with the tutor's course
    const newContent = new Question({
      course,
      topic,
      question,
      ans1,
      ans2,
      ans3,
      ans4,
      correctAns,
    });

    // Save the new content
    await newContent.save();

    return res.json({ message: 'Question created successfully', question: newContent });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating content' });
  }
});




// .............................. GET ALL TUTOR DETAILS ..........................................
/**
 * @swagger
 * components:
 *   schemas:
 *     Tutor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         course:
 *           type: string
 *         phone:
 *           type: number
 *         emailToken:
 *           type: string
 *         isVerified:
 *           type: boolean
 */

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     summary: Admin view all Tutors Details
 *     description: This API is a get request to fetch all tutor details in Ehizua Hub
 *     responses:
 *       200:
 *         description: This API is a get request to fetch all tutor details in Ehizua Hub.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tutor'
 */
app.get('/api/tutors', async (req, res) => {
  try {
    const tutors = await Tutor.find({}, '-password -_id'); // Exclude the password field and _id

    return res.json({ tutors });
  } catch (error) {
    console.error('Error retrieving tutors:', error); // Log the error
    return res.status(500).json({ message: 'Error retrieving tutors' });
  }
});




// .............................. GET ALL STUDENTS DETAILS ..........................................
/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         course:
 *           type: string
 *         phone:
 *           type: number
 *         guardiansPhone:
 *           type: number
 *         duration:
 *           type: string
 *         courseFee:
 *           type: number
 *         amountPaid:
 *           type: number
 *         balance:
 *           type: string
 *         homeAddress:
 *           type: string
 *         id:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         emailToken:
 *           type: string
 *         createdAt:
 *           type: date
 *         updatedAt:
 *           type: date
 */
/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Admin View All Student Details
 *     description: This API is a GET request to fetch all student details in Ehizua Hub.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of students.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: An error occurred while retrieving student details.
 *         content:
 *           application/json:
 *             example:
 *               message: Error retrieving students
 */
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}, '-password -_id'); // Exclude the password field and _id

    return res.json({ students });
  } catch (error) {
    console.error('Error retrieving students:', error); // Log the error
    return res.status(500).json({ message: 'Error retrieving students' });
  }
});










app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
