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
const postSchema = new mongoose.Schema({
    postTitle: String,
    postBody: String,
    postUpvote: Number,
    postDownvote: Number,
    date: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    thread: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread"
    },
    postComments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PostComment"
        }
    ],
})

postSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Post', postSchema)