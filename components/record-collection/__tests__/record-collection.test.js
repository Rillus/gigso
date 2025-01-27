// record-collection.test.js
import { fireEvent } from '@testing-library/dom';
import RecordCollection from '../record-collection.js';
import songLibrary from '../../../song-library.js';

describe('RecordCollection Component', () => {
  let recordCollection;

  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML = '<record-collection></record-collection>';
    recordCollection = document.querySelector('record-collection');
  });

  test('should render song buttons', () => {
    const buttons = recordCollection.shadowRoot.querySelectorAll('button');
    expect(buttons.length).toBe(songLibrary.songs.length);
  });

  test('should dispatch load-song event on button click', () => {
    const song = songLibrary.songs[0];
    const button = recordCollection.shadowRoot.querySelector('button');

    const loadSongHandler = jest.fn();
    recordCollection.addEventListener('load-song', loadSongHandler);

    button.click();

    expect(loadSongHandler).toHaveBeenCalledTimes(1);
    expect(loadSongHandler).toHaveBeenCalledWith(expect.objectContaining({
      detail: song
    }));
  });
});