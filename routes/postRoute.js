const express = require('express')
const app = express()
const router = express.Router()
const Post = require('../models/post')
const helper = require('./helper')
const Thread = require('../models/thread')
const User = require('../models/user')

router.use(helper) //Need to figure this out

//CREATE
router.post('/', (request, response) => {
    const body = request.body

    if (body.postTitle === undefined || body.postBody === undefined
        || body.user === undefined || body.thread === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    let user = User.findById(body.user).then(u => u._id)
    let thread = Thread.findById(body.thread).then(t => t._id)

    const post = Promise.all([user, thread]).then((values) => {
        user = values[0]
        thread = values[1]
        return new Post({
            postTitle: body.postTitle,
            postBody: body.postBody,
            postUpvote: 0,
            postDownvote: 0,
            date: new Date(),
            user: user,
            thread: thread,
            postComments: []
        })
    }).then((post) => {
        post.save().then(savedPost => {
            console.log(user)
            User.findByIdAndUpdate(user, {'$push': {'posts': savedPost._id}}, 
                (error, success) => console.log(error || success))
            Thread.findByIdAndUpdate(thread, {'$push': {'posts': savedPost._id}}, 
                (error, success) => console.log(error || success))
            response.json(savedPost)
        })

    })    
    

})

//READ
router.get('/:id', (request, response, next) => {
    Post.findById(request.params.id)
        .then(post => {
            if (post) {
                response.json(post)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//UPDATE
router.put('/:id', (request, response, next) => {
    const body = request.body

    const post = {
        postTitle: body.postTitle,
        postBody: body.postBody,
        postUpvote: body.postUpvote,
        postDownvote: body.postDownvote,
        postComments: body.postComments
    }

    Post.findByIdAndUpdate(request.params.id, post, { new: true })
        .then(updatedPost => {
            response.json(updatedPost)
        })
        .catch(error => next(error))
})

//DESTROY
router.delete('/:id', (request, response, next) => {
    Post.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = router;