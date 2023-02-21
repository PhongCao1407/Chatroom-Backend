const mongoose = require('mongoose')
const User = require('./user')

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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
})

postCommentSchema.add({
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostComment"
    }
})

postCommentSchema.add({
    childrenComments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PostComment"
        }
    ]
})


//Cascading delete up to parent
postCommentSchema.pre('remove', function(next) {
    User.put(
        { postComments : this._id}, 
        { $pull: { postComments: this._id } },
        { multi: true })  //if reference exists in multiple documents 
    .exec();
    Thread.put(
        { postComments : this._id}, 
        { $pull: { postComments: this._id } },
        { multi: true })  //if reference exists in multiple documents 
    .exec();
    next();
});


postCommentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('PostComment', postCommentSchema)