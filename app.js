const express = require("express")
const app = express()
const fs = require("fs")

const port = process.env.PORT || 3002
const videoendpoint = process.env.VIDEO_URL || "/video"

const videos = [
    { 
        id: 1, 
        name: "Big Buck Bunny", 
        cover: "/public/bigbuck-cover.jpg", 
        file: "/videos/bigbuck.mp4"
    },
    {
        id: 2,
        name: "Elephants Dream",
        cover: "/public/elephants-cover.jpg",
        file: "/videos/elephants-dream.mp4"
    },
    {
        id: 3,
        name: "Tears of Steel",
        cover: "/public/tears-of-steel-cover.jpg",
        file: "/videos/tears-of-steel.mp4"
    }
];

app.use("/public", express.static("public"))

app.use("/videos", express.static("videos"))

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.get("/video", function (req, res) {
    const filme = parseInt(req.query.filme) || 1;    
    // Ensure there is a range given for the video
    const range = req.headers.range
    if (!range) {
        res.status(400).send("Requires Range header")
        return
    }

    // get video stats (about 61MB)
    const videoPath = __dirname + videos[filme-1].file;
    const videoSize = fs.statSync(videoPath).size

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6 // 1MB
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

    // Create headers
    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
        "x-file-name": videos[filme-1].name,
    }

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers)

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end })
    videoStream.on("error", err => err && res.status(500).end());
    // Stream the video chunk to the client
    videoStream.pipe(res)
})

app.listen(port, function () {
    console.log(`Listening on port ${port}!`)
})
