import type { Interests } from "./types";

export const interests: Interests = {
  football: { club: "Real Madrid", player: "Cristiano Ronaldo", number: 7, position: "Full-back" },
  cricket: { team: "Chennai Super Kings", players: ["MS Dhoni", "Virat Kohli"], role: "Bowler", number: 7 },
  // TODO(sandeep): add the Spotify / YouTube link for the track.
  music: { artist: "Seedhe Maut", track: "Do Guna" },
  anime: [
    { title: "Naruto", native: "ナルト" },
    { title: "Dragon Ball Z", native: "ドラゴンボールZ" },
    { title: "Haikyu!!", native: "ハイキュー!!" },
    { title: "Death Note", native: "デスノート" },
    { title: "Attack on Titan", native: "進撃の巨人" },
  ],
  books: {
    favourites: [
      { title: "Shoe Dog", author: "Phil Knight" },
      { title: "The Hidden Hindu", author: "Akshat Gupta" },
      { title: "Men Without Women", author: "Haruki Murakami" },
    ],
    favouriteWriter: "Haruki Murakami",
  },
  // TODO(sandeep): add the treks you've done — they show up as a trail log in "Out there".
  travel: { base: "Haldwani", region: "the Kumaon hills", treks: [] },
};
