const mongoose = require('mongoose');



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_LOCAL,
        //await mongoose.connect(process.env.MONGODB_URI,

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


module.exports = connectDB