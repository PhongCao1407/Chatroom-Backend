const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

// Connect to DB
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    }).catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

// Schema
const userSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    date: Date,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    postComments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PostComment"
        }
    ],
})




userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})



module.exports = mongoose.model('User', userSchema)