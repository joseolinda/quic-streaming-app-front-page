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
      name: "tears of Steel",
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
  })

  filmSelect.addEventListener("change", (event) => {
    const selectedFilm = filmSelect.value
    for (let i = 0; i < filmPostersImages.length; i++) {
        filmPostersImages[i].parentElement.classList.remove("selected")
    }
    filmPostersImages[selectedFilm - 1].parentElement.classList.add("selected")
  });

  for (let poster of filmPosters) {
    poster.addEventListener("click", (event) => {
      const selectedFilm = poster.dataset.film
      filmSelect.value = selectedFilm
      filmSelect.dispatchEvent(new Event("change"))
      filmChoice.dispatchEvent(new Event("submit"))
    })
  }

// Mostrar estatísticas do vídeo
const videoName = document.querySelector("#video-name");
const resolution = document.querySelector("#resolution");
const bitrate = document.querySelector("#bitrate");
const fileSize = document.querySelector("#file-size");
const duration = document.querySelector("#duration");
const protocol = document.querySelector("#protocol");
const latency = document.querySelector("#latency");
const packetsInput = document.querySelector("#p-input");
const packetsOutput = document.querySelector("#p-output");
const bytesInputSize = document.querySelector("#b-input-size");
const playTime = document.querySelector("#play-time");
const firstByte = document.querySelector("#first-byte");
const lastByte = document.querySelector("#last-byte");
const downloadTime = document.querySelector("#download-time");
const bufferingPercent = document.querySelector("#buffering-percent");
const bufferingTime = document.querySelector("#buffering-time");
const pauses = document.querySelector("#pauses");
const videoPlayTime = document.querySelector("#play-time");
const videoPlayTimePercent = document.querySelector("#play-time-percent");