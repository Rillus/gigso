import '../play-button.js';

describe('PlayButton', () => {
  let playButton;

  beforeEach(() => {
    document.body.innerHTML = '<play-button></play-button>';
    playButton = document.querySelector('play-button');
  });

  test('should be defined', () => {
    expect(playButton).toBeDefined();
  });

  test('should dispatch play-clicked event on click', () => {
    const mockCallback = jest.fn();
    playButton.addEventListener('play-clicked', mockCallback);

    const button = playButton.querySelector('button');
    button.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  test('should activate and deactivate correctly', () => {
    playButton.activate();
    expect(playButton.querySelector('button').classList.contains('active')).toBe(true);

    playButton.deactivate();
    expect(playButton.querySelector('button').classList.contains('active')).toBe(false);
  });
}); 