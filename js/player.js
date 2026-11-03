const audio = new Audio();
const listeners = [];

let playlistId = PLAYLISTS[0].id;
let index = 0;
let isPlaying = false;
let shuffleOn = false;
let repeatMode = "off";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
let speedIndex = 2;
let loopStart = null;
let loopEnd = null;

const cover = document.getElementById("player-cover");
const title = document.getElementById("player-title");
const artist = document.getElementById("player-artist");
const playBtn = document.getElementById("btn-play");
const prevBtn = document.getElementById("btn-prev");
const nextBtn = document.getElementById("btn-next");
const shuffleBtn = document.getElementById("btn-shuffle");
const repeatBtn = document.getElementById("btn-repeat");
const progress = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const timeNow = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");
const volumeInput = document.getElementById("volume");
const muteBtn = document.getElementById("btn-mute");
const loopBtn = document.getElementById("btn-loop");
const loopRegion = document.getElementById("loop-region");
const speedBtn = document.getElementById("btn-speed");

function saveState() {
  try {
    localStorage.setItem("playerState", JSON.stringify({
      playlistId: playlistId, index: index, shuffle: shuffleOn,
      repeat: repeatMode, volume: volumeInput.value, speed: speedIndex
    }));
  } catch (e) { }
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem("playerState"));
    if (!s) return;
    playlistId = getPlaylist(s.playlistId).id;
    index = s.index || 0;
    shuffleOn = !!s.shuffle;
    repeatMode = s.repeat || "off";
    volumeInput.value = s.volume;
    if (SPEEDS[s.speed]) speedIndex = s.speed;
  } catch (e) { }
}

function getQueue() {
  return getPlaylistTracks(playlistId);
}

function getTrack() {
  return getQueue()[index];
}

function formatTime(sec) {
  sec = Math.floor(sec || 0);
  const m = Math.floor(sec / 60);
  let s = sec % 60;
  if (s < 10) s = "0" + s;
  return m + ":" + s;
}

function loadSong(i) {
  const queue = getQueue();
  if (queue.length === 0) return;
  index = (i + queue.length) % queue.length;
  audio.src = getTrack().src;
  clearLoop();
  update();
}

function playSong() {
  const p = audio.play();
  if (p) p.catch(function () { });
}

function pauseSong() {
  audio.pause();
}

function togglePlay() {
  if (audio.paused) playSong();
  else pauseSong();
}

function nextSong() {
  const size = getQueue().length;
  if (shuffleOn && size > 1) {
    let pick = Math.floor(Math.random() * (size - 1));
    if (pick >= index) pick++;
    loadSong(pick);
  } else if (shuffleOn) {
    loadSong(index);
  } else {
    loadSong(index + 1);
  }
  playSong();
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    loadSong(index - 1);
    playSong();
  }
}

function toggleShuffle() {
  shuffleOn = !shuffleOn;
  update();
}

function playFrom(id, i) {
  if (id === playlistId && i === index && audio.src) {
    togglePlay();
    return;
  }
  playlistId = getPlaylist(id).id;
  loadSong(i);
  playSong();
}

function updateLoopUI() {
  const hasA = loopStart !== null;
  const hasB = loopEnd !== null;
  const known = isFinite(audio.duration) && audio.duration > 0;

  loopBtn.classList.toggle("is-setting", hasA && !hasB);
  loopBtn.classList.toggle("is-active", hasB);

  if (!hasA) {
    loopBtn.firstElementChild.textContent = "A\u2013B";
    loopBtn.setAttribute("aria-label", "Set loop start (A)");
  } else if (!hasB) {
    loopBtn.firstElementChild.textContent = "A\u2013";
    loopBtn.setAttribute("aria-label", "Set loop end (B)");
  } else {
    loopBtn.firstElementChild.textContent = "A\u2013B";
    loopBtn.setAttribute("aria-label", "Clear loop");
  }

  loopRegion.hidden = !hasA || !known;
  if (hasA && known) {
    const end = hasB ? loopEnd : loopStart;
    loopRegion.style.left = (loopStart / audio.duration) * 100 + "%";
    loopRegion.style.width = ((end - loopStart) / audio.duration) * 100 + "%";
  }
}

function clearLoop() {
  loopStart = null;
  loopEnd = null;
  updateLoopUI();
}

function toggleLoop() {
  if (loopStart === null) {
    loopStart = audio.currentTime;
  } else if (loopEnd === null) {
    if (audio.currentTime - loopStart < 0.5) {
      if (typeof showToast === "function") showToast("Set the loop end later than the start");
      return;
    }
    loopEnd = audio.currentTime;
  } else {
    clearLoop();
    return;
  }
  updateLoopUI();
}

function checkLoop() {
  if (loopEnd !== null && !audio.paused && audio.currentTime >= loopEnd) {
    audio.currentTime = loopStart;
  }
}

function applySpeed() {
  const speed = SPEEDS[speedIndex];
  audio.defaultPlaybackRate = speed;
  audio.playbackRate = speed;
  audio.preservesPitch = true;
  speedBtn.textContent = speed + "x";
  speedBtn.classList.toggle("is-active", speed !== 1);
}

function update() {
  const t = getTrack();
  cover.src = t.cover;
  title.textContent = t.title;
  artist.textContent = t.artist;
  timeTotal.textContent = t.duration;

  playBtn.classList.toggle("is-playing", isPlaying);
  shuffleBtn.classList.toggle("is-active", shuffleOn);
  repeatBtn.classList.toggle("is-active", repeatMode !== "off");
  repeatBtn.classList.toggle("is-one", repeatMode === "one");

  for (let i = 0; i < listeners.length; i++) {
    listeners[i]();
  }
  saveState();
}

function init() {
  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);

  shuffleBtn.addEventListener("click", toggleShuffle);

  repeatBtn.addEventListener("click", function () {
    if (repeatMode === "off") repeatMode = "all";
    else if (repeatMode === "all") repeatMode = "one";
    else repeatMode = "off";
    update();
  });

  volumeInput.addEventListener("input", function () {
    audio.volume = volumeInput.value / 100;
    volumeInput.style.setProperty("--fill", volumeInput.value + "%");
    saveState();
  });

  loopBtn.addEventListener("click", toggleLoop);

  speedBtn.addEventListener("click", function () {
    speedIndex = (speedIndex + 1) % SPEEDS.length;
    applySpeed();
    saveState();
  });

  muteBtn.addEventListener("click", function () {
    audio.muted = !audio.muted;
    muteBtn.classList.toggle("is-muted", audio.muted);
  });

  progress.addEventListener("click", function (e) {
    const box = progress.getBoundingClientRect();
    const fraction = (e.clientX - box.left) / box.width;
    if (!audio.duration) return;
    const time = fraction * audio.duration;
    if (loopEnd !== null && (time < loopStart || time > loopEnd)) clearLoop();
    audio.currentTime = time;
  });

  audio.addEventListener("play", function () {
    isPlaying = true;
    update();
  });

  audio.addEventListener("pause", function () {
    isPlaying = false;
    update();
  });

  audio.addEventListener("loadedmetadata", function () {
    timeTotal.textContent = formatTime(audio.duration);
    updateLoopUI();
  });

  audio.addEventListener("timeupdate", function () {
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progressFill.style.width = percent + "%";
    timeNow.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", function () {
    const lastSong = index === getQueue().length - 1;
    if (repeatMode === "one") {
      audio.currentTime = 0;
      playSong();
    } else if (repeatMode === "off" && lastSong && !shuffleOn) {
      isPlaying = false;
      update();
    } else {
      nextSong();
    }
  });

  setInterval(checkLoop, 50);

  loadState();
  applySpeed();
  audio.volume = volumeInput.value / 100;
  volumeInput.style.setProperty("--fill", volumeInput.value + "%");
  loadSong(index);
}

const Player = {
  init: init,
  onChange: function (fn) { listeners.push(fn); },
  playFrom: playFrom,
  toggleShuffle: toggleShuffle,
  toggle: togglePlay,
  current: function () {
    return { playlistId: playlistId, index: index, id: getTrack().id, playing: isPlaying, shuffle: shuffleOn };
  },
  fmt: formatTime
};