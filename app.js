const express = require('express')
const app = express()
const db = require('./db')
const port = process.env.PORT || 6700
const cors = require('cors')
app.use(cors())

const AuthController = require('./controller/authControler')
app.use('/api/auth', AuthController)

app.get('/', (req, res) => {
    return res.send("app is working fine")
})

app.listen(port, (err, data) => {
    if (err) throw err
    console.log(`server is running on port ${port}`)
})