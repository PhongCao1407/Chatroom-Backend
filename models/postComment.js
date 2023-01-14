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
const postCommentSchema = new mongoose.Schema({
    commentBody: String,
    commentUpvote: Number,
    commentDownvote: Number,
    date: Date,
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
})

postCommentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('PostComment', postCommentSchema)