import BaseComponent from "../base-component.js";
import songLibrary from "../../song-library.js";

/**
 * Record Collection
 * 
 * Offers a list of songs to play from the song library
 * 
 * Dispatched events:
 * - load-song: {song}
 * 
 */
export default class RecordCollection extends BaseComponent {
  constructor() {
   
    const template = `
        <div class="collection"></div>
    `;

    const styles = `
      .collection {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 10px;
          border: 1px solid #ccc;
          background: #f9f9f9;
          margin-bottom: 10px;
      }
      .song-button {
          padding: 10px;
          font-size: 14px;
          background: #e0e0e0;
          border: 1px solid #999;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.3s;
      }
      .song-button:hover {
          background: #d0d0d0;
      }
    `;

    super(template, styles);

    this.createSongButtons();


    this.shadowRoot.querySelectorAll(".song-button").forEach((button) => {
      button.addEventListener("click", (e) => this.loadSong(e));
    });
  }

  createSongButtons() {
    const songs = songLibrary.songs;
    const collectionElement = this.shadowRoot.querySelector('.collection');

    let html = '';

    songs.forEach((song) => {
      const songButton = document.createElement('button');
      songButton.textContent = song.name;
      songButton.addEventListener('click', () => {
        this.loadSong(song);
      });
      collectionElement.appendChild(songButton);
    });
  }

  loadSong(song) {
    this.dispatchEvent(new CustomEvent("load-song", { detail: song }));
  }
}

customElements.define("record-collection", RecordCollection);
