const TRACKS = [
  {
    id: 1, title: "She's The One", artist: "Soni Pabla", album: "She's The One", duration: "2:35",
    src: "./assets/audio/track-1.mp3", cover: "./assets/img/track-1.jpg"
  },
  {
    id: 2, title: "I Like You", artist: "Soni Pabla", album: "I Like You", duration: "2:15",
    src: "./assets/audio/track-2.mp3", cover: "./assets/img/track-2.jpg"
  },
  {
    id: 3, title: "Ashke", artist: "Karan Aujla", album: "AUJLA SZN 1", duration: "3:06",
    src: "./assets/audio/track-3.mp3", cover: "./assets/img/playlist-2.jpg"
  },
  {
    id: 4, title: "Real Bad Man", artist: "Karan Aujla", album: "AUJLA SZN 1", duration: "3:06",
    src: "./assets/audio/track-4.mp3", cover: "./assets/img/playlist-2.jpg"
  },
  {
    id: 5, title: "Straight Up", artist: "Karan Aujla", album: "AUJLA SZN 1", duration: "3:06",
    src: "./assets/audio/track-5.mp3", cover: "./assets/img/playlist-2.jpg"
  },
  {
    id: 6, title: "Rap Killa", artist: "Karan Aujla", album: "AUJLA SZN 1", duration: "3:06",
    src: "./assets/audio/track-6.mp3", cover: "./assets/img/playlist-2.jpg"
  },
  {
    id: 7, title: "Aujla Szn", artist: "Karan Aujla", album: "AUJLA SZN 1", duration: "3:06",
    src: "./assets/audio/track-7.mp3", cover: "./assets/img/playlist-2.jpg"
  },
  {
    id: 8, title: "Step Out", artist: "Raf Saperra", album: "Renaissance", duration: "3:06",
    src: "./assets/audio/track-8.mp3", cover: "./assets/img/playlist-3.jpg"
  },
  {
    id: 9, title: "Broken", artist: "Raf Saperra", album: "Renaissance", duration: "3:06",
    src: "./assets/audio/track-9.mp3", cover: "./assets/img/playlist-3.jpg"
  },
  {
    id: 10, title: "Ni Billo", artist: "Raf Saperra", album: "Renaissance", duration: "3:06",
    src: "./assets/audio/track-10.mp3", cover: "./assets/img/playlist-3.jpg"
  },
  {
    id: 11, title: "Morni", artist: "Raf Saperra", album: "Renaissance", duration: "3:06",
    src: "./assets/audio/track-11.mp3", cover: "./assets/img/playlist-3.jpg"
  },
  {
    id: 12, title: "Sang", artist: "Raf Saperra", album: "Renaissance", duration: "3:06",
    src: "./assets/audio/track-12.mp3", cover: "./assets/img/playlist-3.jpg"
  },
  {
    id: 13, title: "Whatcha Doing", artist: "Diljit Dosanjh", album: "Ghost", duration: "3:06",
    src: "./assets/audio/track-13.mp3", cover: "./assets/img/playlist-4.jpg"
  },
  {
    id: 14, title: "Jatt Vailly", artist: "Diljit Dosanjh", album: "Ghost", duration: "3:06",
    src: "./assets/audio/track-14.mp3", cover: "./assets/img/playlist-4.jpg"
  },
  {
    id: 15, title: "Poppin'", artist: "Diljit Dosanjh", album: "Ghost", duration: "3:06",
    src: "./assets/audio/track-15.mp3", cover: "./assets/img/playlist-4.jpg"
  },
];

const PLAYLISTS = [
  {
    id: "soni-pabla",
    title: "Soni Pabla",
    owner: "Shobit Suman",
    cover: "./assets/img/playlist-1.jpg",
    color: "#674556",
    trackIds: [1, 2],
  },
  {
    id: "karan-aujla",
    title: "AUJLA SZN 1",
    owner: "Karan Aujla",
    cover: "./assets/img/playlist-2.jpg",
    color: "#6c0f26",
    trackIds: [3, 4, 5, 6, 7],
  },
  {
    id: "raf-saperra",
    title: "Renaissance",
    owner: "Raf Saperra",
    cover: "./assets/img/playlist-3.jpg",
    color: "#673664",
    trackIds: [8, 9, 10, 11, 12],
  },
  {
    id: "diljit-dosanjh",
    title: "Ghost",
    owner: "Diljit Dosanjh",
    cover: "./assets/img/playlist-4.jpg",
    color: "#3d6b73",
    trackIds: [13, 14, 15],
  },
];

const LIBRARY = {
  id: "all-songs",
  title: "All Songs",
  owner: "Shobit Suman",
  cover: "./assets/img/playlist-1.jpg",
  trackIds: TRACKS.map(function (t) { return t.id; }),
};

function getPlaylist(id) {
  if (id === LIBRARY.id) return LIBRARY;
  for (let i = 0; i < PLAYLISTS.length; i++) {
    if (PLAYLISTS[i].id === id) return PLAYLISTS[i];
  }
  return PLAYLISTS[0];
}

function getPlaylistTracks(id) {
  const out = [];
  getPlaylist(id).trackIds.forEach(function (tid) {
    for (let j = 0; j < TRACKS.length; j++) {
      if (TRACKS[j].id === tid) { out.push(TRACKS[j]); break; }
    }
  });
  return out;
}