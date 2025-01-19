const playPauseBtn = document.querySelector(".play-pause-btn");
const playonScreen = document.querySelector(".play");
const miniplayerbtn = document.querySelector(".mini-player-btn");
const theaterbtn = document.querySelector(".theater-btn");
const fullScreen = document.querySelector(".full-screen-btn");
const muteBtn = document.querySelector(".mute-btn");
const captionBtn = document.querySelector(".caption-btn");
const speedBtn = document.querySelector(".speed");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const currentTime = document.querySelector(".current-time");
const totalTime = document.querySelector(".total-time");
const volumeslider = document.querySelector(".volume-slider");
const video = document.querySelector("video");
const timeline = document.querySelector(".timeline");
const timelineContainer = document.querySelector(".timeline-container");
const videoContainer = document.querySelector(".videoContainer");

video.textTracks[0].mode = "hidden";

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;
  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
      e.preventDefault();
    case "k":
      tooglePlay();
      break;
    case "f":
      tooogleFullScreenMode();
      break;
    case "t":
      toogleTheaterMode();
      break;
    case "i":
      if (!(e.ctrlKey && e.shiftKey)) tooogleMiniPlayerMode();
      break;
    case "m":
      toogleMute();
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "l":
    case "arrowright":
      skip(+5);
      break;
  }
});

//Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) {
    toggleScrubbing(e);
  }
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) {
    handleTimelineUpdate(e);
  }
});

let isScrubbing = false;
let wasPaused;
timelineContainer.addEventListener("pointerdown", (e) => {
  timelineContainer.setPointerCapture(e.pointerId);
  isScrubbing = true;
  toggleScrubbing(e);
  timelineContainer.addEventListener("pointermove", handleTimelineUpdate);
  timelineContainer.addEventListener(
    "pointerup",
    (e) => {
      isScrubbing = false;
      toggleScrubbing(e);
      timelineContainer.removeEventListener(
        "pointermove",
        handleTimelineUpdate
      );
    },
    { once: true }
  );
});

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) {
      video.play();
    }
  }
}
function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max));
}
function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  let percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  );
  const min = previewImg.offsetWidth / 2 / rect.width;
  const max = 1 - min;
  const previewPercent = clamp(min, percent, max);
  const previewImgSrc = `../assets/previewimages/previewimages${previewImgNumber}.jpg`;
  previewImg.src = previewImgSrc;
  timelineContainer.style.setProperty("--preview-position", percent);
  timelineContainer.style.setProperty("--preview-img-position", previewPercent);

  if (isScrubbing) {
    e.preventDefault();
    thumbnailImg.src = previewImgSrc;
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}
//playback speed
speedBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlayback = video.playbackRate + 0.25;
  if (newPlayback > 2) newPlayback = 0.25;
  video.playbackRate = newPlayback;
  speedBtn.textContent = `${newPlayback}x`;
}

//caption
const caption = video.textTracks[0];
caption.mode = "hidden";

captionBtn.addEventListener("click", toogleCaption);

function toogleCaption() {
  const isHidden = caption.mode === "hidden";
  caption.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

//Duration
video.addEventListener("loadeddata", () => {
  totalTime.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTime.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;

  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);

  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

//Volume
muteBtn.addEventListener("click", toogleMute);

volumeslider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toogleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeslider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeslider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }
  video.volume;
  video.muted;

  videoContainer.dataset.volumeLevel = volumeLevel;
});

//view modes
// document.addEventListener("scroll" , tooogleMiniPlayerMode)

theaterbtn.addEventListener("click", toogleTheaterMode);
fullScreen.addEventListener("click", tooogleFullScreenMode);
miniplayerbtn.addEventListener("click", tooogleMiniPlayerMode);

function toogleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function tooogleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
     screen.orientation.lock("landscape");
  } else {
    document.exitFullscreen();
  }
 
}

function tooogleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});
//play/pause
playonScreen.addEventListener("click" , tooglePlay)

playPauseBtn.addEventListener("click", tooglePlay);
video.addEventListener("click", tooglePlay);

function tooglePlay() {
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
