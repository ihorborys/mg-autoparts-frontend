const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioContext ? new AudioContext() : null;

export const useHaptics = () => {

  // Універсальний синтезатор тонів
  const playTone = (freq, duration, volume) => {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Плавне згасання звуку (envelope)
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  };

  const trigger = (action) => {
    if ("vibrate" in navigator) {
      switch (action) {
        case 'vibrateOnly':
          navigator.vibrate(30); // Короткий "стук" без звуку
          break;

        case 'tick':
          navigator.vibrate(30);
          // playTone(800, 0.05, 0.001); // Короткий низький клік
          break;

        case 'success':
          // Подвійна вібрація для "тріумфу"
          navigator.vibrate([30, 20, 30]);
          // Високий "позитивний" тон
          // playTone(1500, 0.2, 0.005);
          break;

        case 'error':
          navigator.vibrate([40, 80, 40]);
          // playTone(200, 0.3, 0.005); // Низький "гул" помилки
          break;

        case 'copy':
          navigator.vibrate(30);
          // playTone(1200, 0.08, 0.005); // Тонкий цифровий відгук
          break;

        case 'remove':
          navigator.vibrate([50, 50, 30]);
          // // Низхідний тон — ефект видалення
          // playTone(600, 0.2, 0.005);
          break;

        case 'logout':
          navigator.vibrate([60, 100, 60]);
          // // Довгий спад — ефект вимкнення пристрою
          // playTone(800, 0.2, 0.005);
          break;
      }
    }
  };

  return {trigger};
};