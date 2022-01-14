const express = require('express')
const http = require('http')
const path = require('path')
const { get } = require('request')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/models', express.static(path.join(__dirname, './models')))

app.get('/ocv.js', (req, res) => res.sendFile(path.join(__dirname, 'ocv.js')));
app.get('/face-api.js', (req, res) => res.sendFile(path.join(__dirname, 'face-api.js')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'webcam.html')));

app.listen(3000, () => console.log("Listening on port 3000"));
