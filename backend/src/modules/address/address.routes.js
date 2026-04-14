const router = require('express').Router()
const ctrl = require('./address.controller')

router.get('/search', ctrl.search)

module.exports = router
