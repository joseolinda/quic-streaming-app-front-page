import videos from './listVideos.json' assert { type: "json" };

const showVideo = document.getElementById("show-video")
const videoPlayer = document.getElementById("videoPlayer")
const filmChoice = document.forms["film-choice"]
const filmName = document.getElementById("film-name")
const filmSelect = document.getElementById("film-select")
const filmPosters = document.querySelectorAll("#film-posters p")
const filmPostersImages = document.querySelectorAll("#film-posters img")

const videoFinished = document.querySelector(".video-finished")

let pausesCount = 0
let fpsInterval = false

// Mostrar estatísticas do vídeo
const videoName = document.querySelector("#video-name")
const resolution = document.querySelector("#resolution")
const bitrate = document.querySelector("#bitrate")
const fileSize = document.querySelector("#file-size")
const duration = document.querySelector("#duration")

const protocol = document.querySelector("#protocol")
const latency = document.querySelector("#latency")
const fpsRate = document.querySelector("#fps")
const packetsInput = document.querySelector("#p-input")
const packetsOutput = document.querySelector("#p-output")
const bytesInputSize = document.querySelector("#b-input-size")
const playTime = document.querySelector("#play-time")
const firstByte = document.querySelector("#first-byte")
const lastByte = document.querySelector("#last-byte")
const downloadTime = document.querySelector("#download-time")
const bufferingPercent = document.querySelector("#buffering-percent")
const bufferingTime = document.querySelector("#buffering-time")
const pauses = document.querySelector("#pauses")
const videoPlayTimeTotal = document.querySelector("#play-time-total")
const videoPlayTimePercent = document.querySelector("#play-time-percent")

// FPS Metrics
let decodedFrames = 0,
  droppedFrames = 0,
  decodedFPS = [],
  droppedFPS = [],
  startTime = new Date().getTime(),
  actualTimePlay = 0,
  deltaTime = 0
let decodedFPSavg = 0,
  droppedFPSavg = 0,
  currentDecodedFPS = 0,
  currentDroppedFPS = 0

filmChoice.addEventListener("submit", handleFilmChoiceSubmit)
filmSelect.addEventListener("change", handleFilmSelectChange)
filmPosters.forEach(poster => {
  poster.addEventListener("click", handlePosterClick)
})

function handleFilmChoiceSubmit(event) {
  event.preventDefault()
  const formData = new FormData(event.target)
  const film = formData.get("film-select") || 1
  let time_play = moment(new Date().getTime()).format("HH:mm:ss:SSS")
  actualTimePlay = new Date().getTime()
  const selectedVideo = videos[film - 1]
  filmName.textContent = selectedVideo.name
  videoPlayer.src = `/video?filme=${film}`
  videoPlayer.poster = selectedVideo.cover
  videoPlayer.load()
  videoPlayer.play()
  pausesCount = 0
  showVideo.style.display = "flex"
  videoPlayer.style.display = "block"
  videoFinished.style.display = "none"
  videoPlayer.muted = false
  videoPlayer.volume = 0.5
  updateStats({ time_play })
}

function handleFilmSelectChange(event) {
  const selectedFilm = filmSelect.options[filmSelect.selectedIndex].value
  filmPostersImages.forEach(image => {
    image.parentElement.classList.remove("selected")
  })
  filmPostersImages[selectedFilm - 1].parentElement.classList.add("selected")
}

function handlePosterClick(event) {
  const selectedFilm = event.target.parentElement.nodeName === "DIV" ? event.target.dataset.film : event.target.parentElement.dataset.film
  filmSelect.value = selectedFilm
  filmSelect.dispatchEvent(new Event("change"))
  filmChoice.dispatchEvent(new Event("submit"))
  scroll({
    top: showVideo.offsetTop - 10,
    behavior: "smooth"
  })
}

function updateStats(videoInfo) {
  protocol.textContent = location.hostname === "olindaweb.app" ? "HTTP over TCP" : "QUIC/HTTP3 over UDP"
  videoName.textContent = filmName.textContent || "---"
  videoPlayer.addEventListener("loadedmetadata", function () {
    const videoWidth = videoPlayer.videoWidth
    const videoHeight = videoPlayer.videoHeight
    const videoDuration = moment.duration(videoPlayer.duration, "seconds")
    const videoFileSize = videoPlayer.size
    const videoBitrate = videoFileSize / videoPlayer.duration

    resolution.textContent = `${videoWidth}x${videoHeight}` || "---"
    bitrate.textContent = `${Math.round(videoBitrate / 1000)} kbps` || "---"
    duration.textContent = `${videoDuration.minutes()}min ${videoDuration.seconds()}s`

    playTime.textContent = videoInfo.time_play
    firstByte.textContent = moment().format("HH:mm:ss:SSS")

    // Calcular latência
    const latencyTime = parseInt(firstByte.textContent.match(/:(\d{3}$)/)[1]) - parseInt(playTime.textContent.match(/:(\d{3}$)/)[1])
    latency.textContent = `${Math.abs(latencyTime)}ms`
    // Mudar cor dos millisegundos
    playTime.innerHTML = playTime.innerHTML.replace(/:(\d{3})$/, "<i class='ms'>$&</i>")
    firstByte.innerHTML = firstByte.innerHTML.replace(/:(\d{3}$)/, "<i class='ms'>$&</i>")
  })

  let downloadStartTime = null
  let downloadEndTime = null
  let finishDownloadTime = null
  videoPlayer.addEventListener("loadstart", function () {
    pausesCount = 0
    pauses.textContent = pausesCount
    downloadStartTime = new Date()
  })

  videoPlayer.addEventListener("waiting", function () {
    pausesCount++
    pauses.textContent = pausesCount
  })

  videoPlayer.addEventListener("progress", function () {
    if (downloadStartTime) {
      const currentTime = new Date()
      downloadEndTime = moment.duration(currentTime - downloadStartTime)
      downloadTime.textContent = `${downloadEndTime.minutes()}min ${downloadEndTime.seconds()}s`
    }
    let percent = 0
    if (videoPlayer.buffered.length > 0) {
      percent = Math.round((videoPlayer.buffered.end(0) / videoPlayer.duration) * 100)
      bufferingPercent.textContent = `${percent}%`
    }
    if (percent === 100) {
      finishDownloadTime = moment().format("HH:mm:ss:SSS")
      bufferingTime.textContent = finishDownloadTime
      lastByte.textContent = finishDownloadTime
      // Mudar cor dos millisegundos
      lastByte.innerHTML = lastByte.innerHTML.replace(/:(\d{3})$/, "<i class='ms'>$&</i>")
      bufferingTime.innerHTML = bufferingTime.innerHTML.replace(/:(\d{3})$/, "<i class='ms'>$&</i>")
      verPeformance()
    }
  })

  videoPlayer.addEventListener("timeupdate", function () {
    const timePercent = Math.round((videoPlayer.currentTime / videoPlayer.duration) * 100)
    videoPlayTimePercent.textContent = `${timePercent}%`
    if (timePercent === 100) {
      videoPlayTimeTotal.textContent = moment().format("HH:mm:ss:SSS")
      videoPlayTimeTotal.innerHTML = videoPlayTimeTotal.innerHTML.replace(/:(\d{3})$/, "<i class='ms'>$&</i>")
      videoFinished.style.display = "block"
      videoPlayer.style.display = "none"
    }
  })

  videoPlayer.controls = false
  videoPlayer.addEventListener("click", function () {
    if (videoPlayer.paused) {
      videoPlayer.play()
    }
    const newVolume = videoPlayer.volume + 0.1
    videoPlayer.volume = Math.min(newVolume, 1)
  })

  fpsInterval = setInterval(getFPS, 1000)
}

// FPS Mestrics
function getFPS() {
  if (videoPlayer.webkitDecodedFrameCount) {
    let currentTime = new Date().getTime()
    deltaTime = (currentTime - actualTimePlay) / 1000
    actualTimePlay = currentTime

    // Calculate decoded frames per sec.
    let fps = (videoPlayer.webkitDecodedFrameCount - decodedFrames) / deltaTime
    decodedFrames = videoPlayer.webkitDecodedFrameCount
    decodedFPS.push(fps)

    // Calculate dropped frames per sec.
    droppedFrames = videoPlayer.webkitDroppedFrameCount
    fps = (videoPlayer.webkitDroppedFrameCount - droppedFrames) / deltaTime
    droppedFPS.push(fps)

    //calculate averages
    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length
    decodedFPSavg = average([...decodedFPS])
    droppedFPSavg = average([...droppedFPS])
    currentDecodedFPS = Math.round(decodedFPS.slice(-1)[0])
    currentDroppedFPS = Math.round(droppedFPS.slice(-1)[0])

    fpsRate.textContent = `${Math.abs(decodedFPSavg.toFixed(1))} fps`


  } else {
    fpsRate.textContent = "Not supported"
  }
}

const BROWSER = new Array(
  ["Microsoft Edge", /edg/i],
  ["Microsoft Internet Explorer", /trident/i],
  ["Mozilla Firefox", /firefox|fxios/i],
  ["Opera", /opr\//i],
  ["UC Browser", /ucbrowser/i],
  ["Samsung Browser", /samsungbrowser/i],
  ["Google Chrome", /chrome|chromium|crios/i],
  ["Apple Safari", /safari/i],
  ["Unknown", /.+/i],
).find(([, value]) => value.test(window.navigator.userAgent)).shift()

const verPeformance = () => {
  // Medindo a performance dos recursos carregados
  const logs = []
  const resourceEntries = performance.getEntriesByType('resource')
  // console.log(resourceEntries)
  let videoCalls = resourceEntries.filter(r => r.initiatorType == 'video')
  const playbackId = Math.floor(Math.random() * 10000000000)
  for (let vc of videoCalls) {
    logs.push({
      playbackId,
      ...vc.toJSON()
    })
  }

  // Enviar os logs para a rota "/register-log" do servidor
  fetch("/register-log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logs),
  })
  .then(response => response.json())
  .then(data => {
    console.log("Logs registrados com sucesso:", data)
  })
  .catch(error => {
    console.error("Erro ao registrar logs:", error)
  })

  if (fpsInterval) clearInterval(fpsInterval)
}