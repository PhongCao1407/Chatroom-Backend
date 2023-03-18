const express = require('express')
const app = express()
const router = express.Router()
const Post = require('../models/post')
const errorHandler = require('./helper')
const Thread = require('../models/thread')
const User = require('../models/user')
const PostComment = require('../models/postComment')

const jwt = require('jsonwebtoken')

const tokenUtils = require('../utils/token')

//CREATE
router.post('/', (request, response) => {
    const body = request.body

    if (body.postTitle === undefined || body.postBody === undefined
        || body.thread === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    //Get the token to verify that the user is logged in
    const decodedToken = jwt.verify(tokenUtils.getTokenFrom(request), process.env.SECRET)  
    if (!decodedToken.id) {    
        return response.status(401).json({ error: 'token invalid' }) 
     }  
    

    let user = User.findById(decodedToken.id)
        .then(u => {
            return u
        })
        .catch(error => {
            console.log('There was an Error with the userID\n')
            throw new Error(error)
        })
    
    // Need to get threadID when its passed as name
    // This is a temporary solution, might need to find a way to rework this with some kind of token in the future
    let thread = Thread.find({threadName: body.thread})
        .then(t => {
            return t[0]
        })
        .catch(error => {
            console.log('There was an Error with the threadID\n')
            throw new Error(error)
        })

    const post = Promise.all([user, thread]).then((values) => {
        user = values[0]
        thread = values[1]
        console.log(user)
        console.log(thread)
        return new Post({
            postTitle: body.postTitle,
            postBody: body.postBody,
            postUpvote: 0,
            postDownvote: 0,
            date: new Date(),
            user: user._id,
            username: user.username,
            thread: thread._id,
            threadName: thread.threadName,
            postComments: []
        })
    }).then((post) => {
        post.save().then(savedPost => {
            console.log(user)
            //Update references of user
            User.findByIdAndUpdate(user._id, { '$push': { 'posts': savedPost._id } },
                (error, success) => console.log(error || success))

            //Update references of thread
            Thread.findByIdAndUpdate(thread._id, { '$push': { 'posts': savedPost._id } },
                (error, success) => console.log(error || success))

            response.json(savedPost)
        })

    }).catch((error) => {
        console.log(error)
        response.status(400).send({ error: 'There was an Error' })
        response.end()
    })


})

//READ

//Get all posts
router.get('/', (request, response, next) => {
    Post.find({})
        .then(posts => {
            if (posts) {
                response.json(posts)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//Get specific post
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
    //Delete children
    PostComment.deleteMany({ post: request.params.id })

    //Delete references from parents
    Post.findById(request.params.id).then((p) => {
        let post = p

        let user = User.findById(post.user)
            .then(u => u._id)
            .catch(error => {
                console.log('There was an Error with the userID\n')
                throw new Error(error)
            })

        let thread = Thread.findById(post.thread)
            .then(t => t._id)
            .catch(error => {
                console.log('There was an Error with the ThreadID\n')
                throw new Error(error)
            })

        //Remove reference of deleted post from Parent
        const removeParents = Promise.all([user, thread]).then((values) => {
            user = values[0]
            thread = values[1]
            User.findByIdAndUpdate(user, { '$pull': { 'posts': post._id } },
                (error, success) => console.log(error || success))
            Thread.findByIdAndUpdate(thread, { '$pull': { 'posts': post._id } },
                (error, success) => console.log(error || success))
        }).catch((error) => {
            console.log(error)
            response.status(400).send({ error: 'There was an Error' })
            response.end()
        })

    }).then(() => {
        //Deleting the post
        Post.findByIdAndRemove(request.params.id)
            .then(result => {
                response.status(204).end()
            })
            .catch(error => next(error))
    }).catch((error) => {
        console.log(error)
        response.status(400).send({ error: 'There was an Error' })
        response.end()
    })



})

router.use(errorHandler)

module.exports = router;