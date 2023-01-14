const express = require('express')
const app = express()
const router = express.Router()
const Thread = require('../models/thread')
const helper = require('./helper')

router.use(helper) //Need to figure this out

//CREATE
router.post('/', (request, response) => {
    const body = request.body
    console.log(body)

    if (body.threadName === undefined || body.threadDescription === undefined) {
        return response.status(400).json({ error: 'content missing' })
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
    Thread.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = router;