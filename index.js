const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const logger = require('./logger/logger.js')
const config = require('./config.js')

const session = require("express-session")
const cookieParser = require('cookie-parser')

const mongoose = require('./schemas/mongoose.js')

const app = express()

app.use(session({
    secret: "myOwnSecret",
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))
app.use(cookieParser())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

require('./routes/routes.js')(app, mongoose, logger)

app.listen(config.port, () => {
  logger.info(`Server listening on port = ${config.port}`)
})
