const videos = [
  {
    id: 1,
    name: "Big Buck Bunny",
    cover: "/public/bigbuck-cover.jpg",
    poster: "/public/posters/bigbuck.jpg"
  },
  {
    id: 2,
    name: "Elephants Dream",
    cover: "/public/elephants-dream-cover.jpg",
    poster: "/public/posters/elephants-dream.png"
  },
  {
    id: 3,
    name: "Tears of Steel",
    cover: "/public/tears-of-steel-cover.jpg",
    poster: "/public/posters/tears-of-steel.jpg"
  }
]

const videoPlayer = document.getElementById("videoPlayer")
const filmChoice = document.forms["filme-choice"]
const filmName = document.getElementById("film-name")
const filmSelect = document.getElementById("filme-select")
const filmPosters = document.getElementById("film-posters").getElementsByTagName("p")
const filmPostersImages = document.getElementById("film-posters").getElementsByTagName("img")

filmChoice.addEventListener("submit", (event) => {
  event.preventDefault()
  const formData = new FormData(event.target)
  const filme = formData.get("filme")
  filmName.innerHTML = videos[filme - 1].name
  videoPlayer.src = `/video?filme=${filme}`
  videoPlayer.poster = videos[filme - 1].cover
  videoPlayer.load()
  // videoPlayer.controls = false
  videoPlayer.play()
  updateStats({
    time_play: moment().format("HH:mm:ss")
  })
})

filmSelect.addEventListener("change", (event) => {
  const selectedFilm = filmSelect.value
  for (let i = 0; i < filmPostersImages.length; i++) {
    filmPostersImages[i].parentElement.classList.remove("selected")
  }
  filmPostersImages[selectedFilm - 1].parentElement.classList.add("selected")
})

for (let poster of filmPosters) {
  poster.addEventListener("click", (event) => {
    const selectedFilm = poster.dataset.film
    filmSelect.value = selectedFilm
    filmSelect.dispatchEvent(new Event("change"))
    filmChoice.dispatchEvent(new Event("submit"))
  })
}

// Mostrar estatísticas do vídeo
const videoName = document.querySelector("#video-name")
const resolution = document.querySelector("#resolution")
const bitrate = document.querySelector("#bitrate")
const fileSize = document.querySelector("#file-size")
const duration = document.querySelector("#duration")

const protocol = document.querySelector("#protocol")
const latency = document.querySelector("#latency")
const packetsInput = document.querySelector("#p-input")
const packetsOutput = document.querySelector("#p-output")
const bytesInputSize = document.querySelector("#b-input-size")
const playTime = document.querySelector("#play-time")
const firstByte = document.querySelector("#first-byte")
const lastByte = document.querySelector("#last-byte")
const downloadTime = document.querySelector("#download-time")
const bufferingPercent = document.querySelector("#buffering-percent")
const bufferingTime = document.querySelector("#buffering-time")
let pausesCount = 0
const pauses = document.querySelector("#pauses")
const videoPlayTimeTotal = document.querySelector("#play-time-total")
const videoPlayTimePercent = document.querySelector("#play-time-percent")

updateStats = (videoinf) => {
  videoName.innerText = filmName.innerText || "---"
  videoPlayer.addEventListener("loadedmetadata", function () {
    const v = {
      width: videoPlayer.videoWidth,
      height: videoPlayer.videoHeight,
      duration: moment.duration(videoPlayer.duration, "seconds"),
      file_size: videoPlayer.size,
      bitrate: videoPlayer.size / videoPlayer.duration,
    }

    resolution.innerText = (v.width + "x" + v.height) || "---"
    bitrate.innerText = (Math.round(v.bitrate / 1000) + " kbps") || "---"
    duration.innerText = `${v.duration.minutes()}min ${v.duration.seconds()}s`

    playTime.innerText = videoinf.time_play
    firstByte.innerText = moment().format("HH:mm:ss")
  })
  
  let downloadStartTime = null
  let downloadEndTime = null
  let finishDownloadTime = null
  videoPlayer.addEventListener("loadstart", function () {
    pausesCount = 0
    pauses.innerText = pausesCount
    downloadStartTime = new Date()
  })

  videoPlayer.addEventListener("waiting", function () {
    pausesCount++
    pauses.innerText = pausesCount
  });

  // Evento atualização de tempo
  videoPlayer.addEventListener('progress', function () {
    if (downloadStartTime) {
      let currentTime = new Date()
      downloadEndTime = moment.duration(currentTime - downloadStartTime)
      downloadTime.innerText = `${downloadEndTime.minutes()}min ${downloadEndTime.seconds()}s`
    }
    let percent = 0
    if (videoPlayer.buffered.length > 0) {
      percent = Math.round((videoPlayer.buffered.end(0) / videoPlayer.duration) * 100)
      bufferingPercent.innerText = `${percent}%`
    }
    if (percent === 100) {
      finishDownloadTime = moment().format("HH:mm:ss")
      bufferingTime.innerText = `${finishDownloadTime}s`
    }
  });

  videoPlayer.addEventListener("timeupdate", function () {
    let timePercent = Math.round((videoPlayer.currentTime / videoPlayer.duration) * 100)
    videoPlayTimePercent.innerText = `${timePercent}%`
    if (timePercent === 100) {
      videoPlayTimeTotal.innerText = `${moment().format("HH:mm:ss")}s`
    }
  });
}

updateStats({ play_time: 0 })