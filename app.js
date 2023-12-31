const express = require("express")
const app = express()
const fs = require("fs")
const { insertLogs } = require("./database/db")

const port = process.env.PORT || 3002
const videoendpoint = process.env.VIDEO_URL || "/video?filme=1"

const videos = require("./public/js/listVideos.json")
const { Console } = require("console")
const e = require("express")

app.use("/public", express.static("public"))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.get("/video", function (req, res) {
    const filme = req.query.filme || 1

    // Ensure there is a range given for the video
    let range = req.headers.range
    if (!range) {
        // res.status(400).send("Requires Range header")
        range = "bytes=0-"
    }

    // get video stats (about 61MB)
    const videoPath = __dirname + videos[filme - 1].file
    const videoSize = fs.statSync(videoPath).size

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    // Create headers
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
        "x-film-name": videos[filme - 1].name
    }

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers)

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end })

    // Stream the video chunk to the client
    videoStream.pipe(res)
})

// Persistir os logs no banco de dados
app.post("/register-log", async function (req, res, next) {
    const logs = req.body
    try {
        await insertLogs(logs).then(result => {
            console.log(result) 
            return res.status(201).send({ message: "Logs salvos com sucesso" })
        })
        .catch(error => {
            next(res.status(400).send({ message: error.message }))
        })
    } catch (error) {
        next(res.status(400).send({ message: error.message }))
    }
})


app.listen(port, function () {
    console.log(`Listening on port ${port}!`)
})