const express = require('express')
const app = express()
const router = express.Router()
const PostComment = require('../models/postComment')
const helper = require('./helper')
const Post = require('../models/post')

router.use(helper) //Need to figure this out

//CREATE
router.post('/', (request, response) => {
    const body = request.body

    if (body.commentBody === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    let postID;
    let postComment = Post.findById(body.post)
    .then(p => p._id)
    .then((value) => {
        postID = value
        return new PostComment({
            commentBody: body.commentBody,
            commentUpvote: 0,
            commentDownvote: 0,
            date: new Date(),
            post: postID
        })
    }).then((postComment) => {
        postComment.save().then(savedPostComment => {
            Post.findByIdAndUpdate(postID, {'$push': {'postComments': savedPostComment._id}}, 
                (error, success) => console.log(error || success))
            response.json(savedPostComment)
        })
    })
     
})

//READ
router.get('/:id', (request, response, next) => {
    PostComment.findById(request.params.id)
        .then(postComment => {
            if (postComment) {
                response.json(postComment)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//UPDATE
router.put('/:id', (request, response, next) => {
    const body = request.body

    const postComment = {
        commentBody: body.commentBody,
        commentUpvote: body.commentUpvote,
        commentDownvote: body.commentDownvote,
    }

    PostComment.findByIdAndUpdate(request.params.id, postComment, { new: true })
        .then(updatedPostComment => {
            response.json(updatedPostComment)
        })
        .catch(error => next(error))
})

//DESTROY
router.delete('/:id', (request, response, next) => {
    PostComment.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = router;