const express = require('express')
const app = express()

// catch rogue calls
app.all("/{*splat}", (req, res) => {
    console.log("Unhandled route:", req.path)
    res.status(404).send("Route not found")
})

module.exports = { app }

