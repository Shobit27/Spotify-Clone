const view = document.getElementById("view");
const searchInput = document.getElementById("nav-search");
const toastBox = document.getElementById("toast");
let toastTimer;

let homeFilter = "all";
let libFilter = "all";
let openPlaylistId = null;

function icon(name, extra) {
  return '<svg class="ico ' + (extra || "") + '"><use href="#i-' + name + '"></use></svg>';
}

function countText(n) {
  if (n === 1) return "1 Song";
  return n + " Songs";
}

function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastBox.classList.remove("is-visible");
  }, 2500);
}

function playTrack(song) {
  if (Player.current().id === song.id) {
    Player.toggle();
  } else {
    Player.playFrom(LIBRARY.id, LIBRARY.trackIds.indexOf(song.id));
  }
}

function playPlaylist(id) {
  if (getPlaylistTracks(id).length === 0) {
    showToast("This playlist has no songs yet");
  } else if (Player.current().playlistId === id) {
    Player.toggle();
  } else {
    Player.playFrom(id, 0);
  }
}

function shufflePlaylist(id) {
  const tracks = getPlaylistTracks(id);
  if (tracks.length === 0) {
    showToast("This playlist has no songs yet");
    return;
  }
  const cur = Player.current();
  Player.toggleShuffle();
  const turnedOn = !cur.shuffle;
  if (turnedOn && (cur.playlistId !== id || !cur.playing)) {
    Player.playFrom(id, Math.floor(Math.random() * tracks.length));
  }
}

function searchPage() {
  const text = searchInput.value.toLowerCase();
  const items = view.querySelectorAll(".card, .track-row");
  let shown = 0;

  for (let i = 0; i < items.length; i++) {
    const match = items[i].getAttribute("data-search").indexOf(text) !== -1;
    items[i].hidden = !match;
    if (match) shown++;
  }

  const sections = view.querySelectorAll(".home-section");
  for (let j = 0; j < sections.length; j++) {
    sections[j].hidden = !sections[j].querySelector(".card:not([hidden])");
  }

  const note = document.getElementById("grid-empty") || document.getElementById("table-empty");
  if (note && items.length > 0) note.hidden = shown > 0;
}

searchInput.addEventListener("input", searchPage);

function mark(selector, test) {
  const cur = Player.current();
  const items = document.querySelectorAll(selector);
  for (let i = 0; i < items.length; i++) {
    const on = test(items[i], cur);
    items[i].classList.toggle("is-current", on);
    items[i].classList.toggle("is-playing", on && cur.playing);
  }
}

function highlight() {
  const cur = Player.current();

  mark(".track-row", function (row, cur) {
    return cur.playlistId === openPlaylistId && Number(row.getAttribute("data-index")) === cur.index;
  });
  mark(".card[data-playlist-id], .lib-item[data-playlist-id]", function (item, cur) {
    return item.getAttribute("data-playlist-id") === cur.playlistId;
  });
  mark(".card[data-track-id], .lib-item[data-track-id]", function (item, cur) {
    return Number(item.getAttribute("data-track-id")) === cur.id;
  });

  const heroButton = document.getElementById("hero-play");
  if (heroButton) {
    heroButton.classList.toggle("is-playing", cur.playlistId === openPlaylistId && cur.playing);
  }

  const heroShuffle = document.getElementById("hero-shuffle");
  if (heroShuffle) heroShuffle.classList.toggle("is-active", cur.shuffle);
}

function makeLibItem(tag, cover, title, sub) {
  const item = document.createElement(tag);
  item.className = "lib-item";
  item.innerHTML = '<img class="lib-item-cover" alt=""/>' +
    '<span class="lib-item-meta"><strong></strong><small></small></span>';
  item.querySelector("img").src = cover;
  item.querySelector("strong").textContent = title;
  item.querySelector("small").textContent = sub;
  return item;
}

function drawSidebar() {
  const list = document.querySelector(".lib-items");
  list.innerHTML = "";

  if (libFilter !== "music") {
    PLAYLISTS.forEach(function (pl) {
      const sub = "Playlist \u2022 " + countText(getPlaylistTracks(pl.id).length);
      const item = makeLibItem("a", pl.cover, pl.title, sub);
      item.href = "#/playlist/" + pl.id;
      item.setAttribute("data-playlist-id", pl.id);
      tintOnHover(item, pl.color);
      if (pl.id === openPlaylistId) item.classList.add("is-active");
      list.appendChild(item);
    });
  }

  if (libFilter !== "playlists") {
    TRACKS.forEach(function (song) {
      const item = makeLibItem("div", song.cover, song.title, "Song \u2022 " + song.artist);
      item.setAttribute("data-track-id", song.id);
      if (playlistColorOf(song)) tintOnHover(item, playlistColorOf(song));
      item.addEventListener("click", function () { playTrack(song); });
      list.appendChild(item);
    });
  }

  highlight();
}

function setLibFilter(name) {
  if (libFilter === name) libFilter = "all";
  else libFilter = name;

  const chips = document.querySelectorAll(".lib-chips .chip");
  for (let i = 0; i < chips.length; i++) {
    chips[i].classList.toggle("chip--active", chips[i].getAttribute("data-lib-filter") === libFilter);
  }
  drawSidebar();
}

const libChips = document.querySelectorAll(".lib-chips .chip");
for (let c = 0; c < libChips.length; c++) {
  libChips[c].addEventListener("click", function () {
    setLibFilter(this.getAttribute("data-lib-filter"));
  });
}

document.getElementById("sidebar-expand").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("is-expanded");
});

document.getElementById("btn-fullscreen").addEventListener("click", function () {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

function makeCard(title, sub, cover, searchText, openIt, playIt) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = '<span class="card-art"><img alt=""/></span>' +
    '<span class="card-title"></span><span class="card-sub"></span>';
  card.querySelector("img").src = cover;
  card.querySelector(".card-title").textContent = title;
  card.querySelector(".card-sub").textContent = sub;
  card.setAttribute("data-search", searchText.toLowerCase());
  card.addEventListener("click", openIt);

  const button = document.createElement("button");
  button.className = "card-play";
  button.innerHTML = icon("play", "ico-play") + icon("pause", "ico-pause");
  button.addEventListener("click", function (e) {
    e.stopPropagation();
    playIt();
  });
  card.querySelector(".card-art").appendChild(button);
  return card;
}

function tintOnHover(card, color) {
  card.addEventListener("mouseenter", function () {
    view.style.setProperty("--tint", color);
  });
  card.addEventListener("mouseleave", function () {
    view.style.removeProperty("--tint");
  });
}

function playlistColorOf(song) {
  for (let i = 0; i < PLAYLISTS.length; i++) {
    if (PLAYLISTS[i].trackIds.indexOf(song.id) !== -1) return PLAYLISTS[i].color;
  }
  return null;
}

function makeSection(title, showAllFilter, isFirst) {
  const section = document.createElement("section");
  section.className = "home-section";

  const head = document.createElement("div");
  head.className = "section-head";
  const heading = document.createElement(isFirst ? "h1" : "h2");
  heading.textContent = title;
  head.appendChild(heading);

  if (showAllFilter) {
    const more = document.createElement("button");
    more.className = "show-all";
    more.textContent = "Show all";
    more.addEventListener("click", function () { setHomeFilter(showAllFilter); });
    head.appendChild(more);
  }

  const grid = document.createElement("div");
  grid.className = "card-grid";
  section.appendChild(head);
  section.appendChild(grid);
  return { section: section, grid: grid };
}

function drawHomeSections() {
  const host = document.getElementById("home-sections");
  host.innerHTML = "";
  let first = true;

  if (homeFilter !== "music") {
    const box1 = makeSection("Playlists", homeFilter === "all" ? "playlists" : null, first);
    first = false;
    PLAYLISTS.forEach(function (pl) {
      const sub = "Playlist \u2022 " + countText(getPlaylistTracks(pl.id).length);
      const card = makeCard(pl.title, sub, pl.cover, pl.title + " " + pl.owner,
        function () { window.location.hash = "#/playlist/" + pl.id; },
        function () { playPlaylist(pl.id); });
      card.setAttribute("data-playlist-id", pl.id);
      tintOnHover(card, pl.color);
      box1.grid.appendChild(card);
    });
    host.appendChild(box1.section);
  }

  if (homeFilter !== "playlists") {
    const box2 = makeSection("Songs", homeFilter === "all" ? "music" : null, first);
    TRACKS.forEach(function (song) {
      const card = makeCard(song.title, song.artist, song.cover,
        song.title + " " + song.artist + " " + song.album,
        function () { playTrack(song); },
        function () { playTrack(song); });
      card.setAttribute("data-track-id", song.id);
      if (playlistColorOf(song)) tintOnHover(card, playlistColorOf(song));
      box2.grid.appendChild(card);
    });
    host.appendChild(box2.section);
  }

  searchPage();
  highlight();
}

function setHomeFilter(name) {
  homeFilter = name;
  const chips = view.querySelectorAll(".chips-row .chip");
  for (let i = 0; i < chips.length; i++) {
    chips[i].classList.toggle("chip--active", chips[i].getAttribute("data-filter") === name);
  }
  drawHomeSections();
}

function showHome() {
  const chips = view.querySelectorAll(".chips-row .chip");
  for (let i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      setHomeFilter(this.getAttribute("data-filter"));
    });
  }
  setHomeFilter(homeFilter);
}

function showPlaylist(pl) {
  const tracks = getPlaylistTracks(pl.id);

  if (pl.color) {
    view.querySelector(".playlist-hero").style.background =
      "linear-gradient(180deg, " + pl.color + " 0%, #121212 100%)";
  }
  view.querySelector(".playlist-hero-title").textContent = pl.title;
  view.querySelector(".playlist-hero-owner strong").textContent = pl.owner;
  view.querySelector(".playlist-hero-cover").src = pl.cover;
  view.querySelector('[data-slot="song-count"]').textContent = countText(tracks.length);

  const tbody = document.getElementById("track-rows");
  tracks.forEach(function (song, i) {
    const row = document.createElement("tr");
    row.className = "track-row";
    row.setAttribute("data-index", i);
    row.setAttribute("data-track-id", song.id);
    row.setAttribute("data-search", (song.title + " " + song.artist + " " + song.album).toLowerCase());
    row.innerHTML =
      '<td class="col-num"><span class="row-num">' + (i + 1) + "</span>" +
      '<span class="row-play">' + icon("play") + "</span>" +
      '<span class="row-pause">' + icon("pause") + "</span>" +
      '<span class="row-eq"><span></span><span></span><span></span></span></td>' +
      '<td class="col-title"><img class="row-cover" alt=""/>' +
      '<span class="tt"><strong class="row-title"></strong><small class="row-artist"></small></span></td>' +
      '<td class="col-album"></td><td class="col-duration"></td>';
    row.querySelector(".row-cover").src = song.cover;
    row.querySelector(".row-title").textContent = song.title;
    row.querySelector(".row-artist").textContent = song.artist;
    row.querySelector(".col-album").textContent = song.album;
    row.querySelector(".col-duration").textContent = song.duration;
    row.addEventListener("click", function () { Player.playFrom(pl.id, i); });
    tbody.appendChild(row);
  });

  document.getElementById("hero-play").addEventListener("click", function () {
    playPlaylist(pl.id);
  });
  document.getElementById("hero-shuffle").addEventListener("click", function () {
    shufflePlaylist(pl.id);
  });

  if (tracks.length === 0) {
    const note = document.getElementById("table-empty");
    note.textContent = "This playlist has no songs yet.";
    note.hidden = false;
  }
}

function loadDurations() {
  TRACKS.forEach(function (song) {
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = song.src;
    probe.addEventListener("loadedmetadata", function () {
      song.duration = Player.fmt(probe.duration);

      const cell = document.querySelector('.track-row[data-track-id="' + song.id + '"] .col-duration');
      if (cell) cell.textContent = song.duration;

      if (Player.current().id === song.id) {
        document.getElementById("time-total").textContent = song.duration;
      }
    });
  });
}

function getPlaylistFromAddress() {
  const parts = window.location.hash.split("/");
  if (parts[1] === "playlist") {
    for (let i = 0; i < PLAYLISTS.length; i++) {
      if (PLAYLISTS[i].id === parts[2]) return PLAYLISTS[i];
    }
  }
  return null;
}

function showPage() {
  const pl = getPlaylistFromAddress();
  searchInput.value = "";
  view.innerHTML = "";

  if (pl) {
    openPlaylistId = pl.id;
    view.className = "content content--playlist";
    view.appendChild(document.getElementById("tpl-playlist").content.cloneNode(true));
    showPlaylist(pl);
    document.title = pl.title + " | Spotify";
  } else {
    openPlaylistId = null;
    view.className = "content content--home";
    view.appendChild(document.getElementById("tpl-home").content.cloneNode(true));
    showHome();
    document.title = "Spotify";
  }

  drawSidebar();
  view.scrollTop = 0;
  highlight();
}

window.addEventListener("hashchange", showPage);

Player.init();
Player.onChange(highlight);
showPage();
loadDurations();