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
        border: 1px  #ccc;
        background: #f9f9f9;
        margin-bottom: 10px;
        perspective: 1000px;
        perspective-origin: right top;
      }

      .song-button {
        font-size: 14px;
        cursor: pointer;
        width: 352px;
        height: 40px;
        transition: transform 0.3s, box-shadow 0.3s;
        transform-style: preserve-3d;
        transform: rotateX(0deg) rotateY(0deg) translate3d(-25px, 0, -100px);
        position: relative;
        border: 0;
      }

      .song-button:hover {
        transform: rotateX(0deg) rotateY(10deg);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        z-index: 1;
      }

      .cassette-face {
        width: 352px;
        height: 40px;
        backface-visibility: visible;
        border: 1px solid #ccc;
        position: absolute;
        top: 0;
        left: 0;
      }

      .cassette-face.front {
        transform: rotateX(0deg) rotateY(0deg);
        background-color: #f0f0f0;
      }

      .cassette-face.back {
        transform: rotateX(180deg) rotateY(0deg);
        background-color: #777777;
      }

      .cassette-face.side-left,
      .cassette-face.side-right {
        width: 150px;
        transform-origin: left top;
      }

      .cassette-face.side-left {
        transform: rotateX(0deg) rotateY(-90deg) translateZ(150px);
        background-color: #777777;
        transform-origin: right top;
      }

      .cassette-face.side-right {
        transform: rotateX(0deg) rotateY(90deg) translate3d(150px, 0px, 202px);
        background-color: #777777;
        transform-origin: right top;
      }

      .cassette-face.top {
        width: 352px;
        height: 150px;
        transform: rotateX(90deg) rotateY(0deg) translate3d(0px, -80px, 75px);
        background-color: #ffffff;
      }
        
      .cassette-face.bottom {
        width: 352px;
        height: 150px;
        transform: rotateX(-90deg) rotateY(0deg) translate3d(0px, 76px, -35px);
        background-color: #999;
      }

      .label {
        display: flex;
        height: 100%;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
      }
      
      .label .song-title {
        font-size: 14px;
        font-weight: bold;
      }
      
      .label .song-artist {
        font-size: 12px;
      }
    `;

    super(template, styles);

    this.createSongButtons();
  }

  createSongButtons() {
    const songs = songLibrary.songs;
    const collectionElement = this.shadowRoot.querySelector('.collection');

    let html = '';

    songs.forEach((song, index) => {
      const songButton = document.createElement('button');
      songButton.classList.add('song-button');
      songButton.style.zIndex = songs.length - index;
      songButton.innerHTML = `
        <div class="cassette-face front">
          <div class="label">
            <span class="song-title">${song.name}</span>
            <span class="song-artist">${song.artist}</span>
          </div>
        </div>
        <div class="cassette-face side-left"></div>
        <div class="cassette-face side-right"></div>
        <div class="cassette-face top"></div>
        <div class="cassette-face bottom"></div>
      `;
      songButton.addEventListener('click', () => {
        this.loadSong(song);
      });
      collectionElement.appendChild(songButton);
    });
  }

  loadSong(song) {
    console.log('loading song?', song);
    this.dispatchEvent(new CustomEvent("load-song", { detail: song }));
  }
}

customElements.define("record-collection", RecordCollection);
