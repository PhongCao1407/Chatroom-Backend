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
const threadSchema = new mongoose.Schema({
    threadName: String,
    threadDescription: String,
    date: Date,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
})

threadSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Thread', threadSchema)