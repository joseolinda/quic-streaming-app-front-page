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
];

const videoPlayer = document.getElementById("videoPlayer");
const filmChoice = document.forms["film-choice"];
const filmName = document.getElementById("film-name");
const filmSelect = document.getElementById("film-select");
const filmPosters = document.querySelectorAll("#film-posters p");
const filmPostersImages = document.querySelectorAll("#film-posters img");

let pausesCount = 0;

filmChoice.addEventListener("submit", handleFilmChoiceSubmit);
filmSelect.addEventListener("change", handleFilmSelectChange);
filmPosters.forEach(poster => {
  poster.addEventListener("click", handlePosterClick);
});

function handleFilmChoiceSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const film = formData.get("film-select");
  const selectedVideo = videos[film - 1];
  filmName.textContent = selectedVideo.name;
  videoPlayer.src = `/video?filme=${film}`;
  videoPlayer.poster = selectedVideo.cover;
  videoPlayer.load();
  videoPlayer.play();
  pausesCount = 0;
  updateStats({ time_play: moment().format("HH:mm:ss") });
}

function handleFilmSelectChange(event) {
  const selectedFilm = filmSelect.options[filmSelect.selectedIndex].value;
  filmPostersImages.forEach(image => {
    image.parentElement.classList.remove("selected");
  });
  console.log(filmSelect);
  filmPostersImages[selectedFilm - 1].parentElement.classList.add("selected");
}

function handlePosterClick(event) {
  const selectedFilm = event.target.dataset.film;
  filmSelect.value = selectedFilm;
  filmSelect.dispatchEvent(new Event("change"));
  filmChoice.dispatchEvent(new Event("submit"));
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
const videoPlayTimeTotal = document.querySelector("#play-time-total");
const videoPlayTimePercent = document.querySelector("#play-time-percent");

function updateStats(videoInfo) {
  protocol.textContent = location.hostname === "olindaweb.app" ? "HTTP over TCP" : "QUIC/HTTP3 over UDP";
  videoName.textContent = filmName.textContent || "---";
  videoPlayer.addEventListener("loadedmetadata", function () {
    const videoWidth = videoPlayer.videoWidth;
    const videoHeight = videoPlayer.videoHeight;
    const videoDuration = moment.duration(videoPlayer.duration, "seconds");
    const videoFileSize = videoPlayer.size;
    const videoBitrate = videoFileSize / videoPlayer.duration;

    resolution.textContent = `${videoWidth}x${videoHeight}` || "---";
    bitrate.textContent = `${Math.round(videoBitrate / 1000)} kbps` || "---";
    duration.textContent = `${videoDuration.minutes()}min ${videoDuration.seconds()}s`;

    playTime.textContent = videoInfo.time_play;
    firstByte.textContent = moment().format("HH:mm:ss");
  });

  let downloadStartTime = null;
  let downloadEndTime = null;
  let finishDownloadTime = null;
  videoPlayer.addEventListener("loadstart", function () {
    pausesCount = 0;
    pauses.textContent = pausesCount;
    downloadStartTime = new Date();
  });

  videoPlayer.addEventListener("waiting", function () {
    pausesCount++;
    pauses.textContent = pausesCount;
  });

  videoPlayer.addEventListener("progress", function () {
    if (downloadStartTime) {
      const currentTime = new Date();
      downloadEndTime = moment.duration(currentTime - downloadStartTime);
      downloadTime.textContent = `${downloadEndTime.minutes()}min ${downloadEndTime.seconds()}s`;
    }
    let percent = 0;
    if (videoPlayer.buffered.length > 0) {
      percent = Math.round((videoPlayer.buffered.end(0) / videoPlayer.duration) * 100);
      bufferingPercent.textContent = `${percent}%`;
    }
    if (percent === 100) {
      finishDownloadTime = moment().format("HH:mm:ss");
      bufferingTime.textContent = finishDownloadTime;
      lastByte.textContent = finishDownloadTime;
    }
  });

  videoPlayer.addEventListener("timeupdate", function () {
    const timePercent = Math.round((videoPlayer.currentTime / videoPlayer.duration) * 100);
    videoPlayTimePercent.textContent = `${timePercent}%`;
    if (timePercent === 100) {
      videoPlayTimeTotal.textContent = `${moment().format("HH:mm:ss")}s`;
    }
  });

  videoPlayer.controls = false;
}

updateStats({ play_time: 0 });