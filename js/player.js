const audio = new Audio();
const listeners = [];

let playlistId = PLAYLISTS[0].id;
let index = 0;
let isPlaying = false;
let shuffleOn = false;
let repeatMode = "off";

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

function saveState() {
  try {
    localStorage.setItem("playerState", JSON.stringify({
      playlistId: playlistId, index: index, shuffle: shuffleOn,
      repeat: repeatMode, volume: volumeInput.value
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
  if (shuffleOn) {
    loadSong(Math.floor(Math.random() * getQueue().length));
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

  muteBtn.addEventListener("click", function () {
    audio.muted = !audio.muted;
    muteBtn.classList.toggle("is-muted", audio.muted);
  });

  progress.addEventListener("click", function (e) {
    const box = progress.getBoundingClientRect();
    const fraction = (e.clientX - box.left) / box.width;
    if (audio.duration) audio.currentTime = fraction * audio.duration;
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

  loadState();
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