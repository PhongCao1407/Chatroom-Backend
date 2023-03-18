const express = require('express')
const app = express()
const router = express.Router()
const Thread = require('../models/thread')
const Post = require('../models/post')
const helper = require('./helper')

const tokenUtils = require('../utils/token')

router.use(helper) //Need to figure this out

const jwt = require('jsonwebtoken')

//CREATE
router.post('/', (request, response) => {
    const body = request.body
    console.log(body)

    if (body.threadName === undefined || body.threadDescription === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    // A token is needed to create a Thread, but the user won't be link to it
    //Get the token to verify that the user is logged in
    const decodedToken = jwt.verify(tokenUtils.getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }

    const thread = new Thread({
        threadName: body.threadName,
        threadDescription: body.threadDescription,
        date: new Date(),
        posts: []
    })

    thread.save().then(savedThread => {
        response.json(savedThread)
    })
})

//READ

//Get all threads
router.get('/', (request, response, next) => {
    Thread.find({})
        .then((threads) => {
            if (threads) {
                response.json(threads)
            } else {
                response.status(404).end()
            }
            // console.log(threads)
        })
        .catch(error => next(error))
})


//Get specific threads
router.get('/:id', (request, response, next) => {
    Thread.findById(request.params.id)
        .then(thread => {
            if (thread) {
                response.json(thread)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

//UPDATE
router.put('/:id', (request, response, next) => {
    const body = request.body

    const thread = {
        threadName: body.threadName,
        threadDescription: body.threadDescription,
        posts: body.posts
    }

    Thread.findByIdAndUpdate(request.params.id, thread, { new: true })
        .then(updatedThread => {
            response.json(updatedThread)
        })
        .catch(error => next(error))
})

//DESTROY
router.delete('/:id', (request, response, next) => {
    //Delete associated Post
    Post.deleteMany({ thread: request.params.id })

    //Delete thread
    Thread.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = router;