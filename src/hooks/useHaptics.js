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
          navigator.vibrate([40, 30, 40]);
          // Високий "позитивний" тон
          // playTone(1500, 0.2, 0.005);
          break;

        case 'error':
          navigator.vibrate([50, 100, 50]);
          // playTone(200, 0.3, 0.005); // Низький "гул" помилки
          break;

        case 'copy':
          navigator.vibrate(40);
          // playTone(1200, 0.08, 0.005); // Тонкий цифровий відгук
          break;

        case 'remove':
          navigator.vibrate(40);
          // // Низхідний тон — ефект видалення
          // playTone(600, 0.2, 0.005);
          break;

        case 'logout':
          navigator.vibrate([50, 50, 50]);
          // // Довгий спад — ефект вимкнення пристрою
          // playTone(800, 0.2, 0.005);
          break;
      }
    }
  };

  return {trigger};
};


// const AudioContext = window.AudioContext || window.webkitAudioContext;
// const audioCtx = AudioContext ? new AudioContext() : null;
//
// export const useHaptics = () => {
//
//   /**
//    * playSweep — створює звук, що змінює висоту (ковзає)
//    * @param {number} startFreq - початкова частота (Гц)
//    * @param {number} endFreq - кінцева частота (Гц)
//    * @param {number} duration - тривалість (сек)
//    * @param {number} volume - гучність (0.0 до 1.0)
//    */
//   const playSweep = (startFreq, endFreq, duration, volume) => {
//     if (!audioCtx) return;
//     if (audioCtx.state === 'suspended') audioCtx.resume();
//
//     const oscillator = audioCtx.createOscillator();
//     const gainNode = audioCtx.createGain();
//
//     oscillator.type = 'sine';
//
//     // Встановлюємо початкову точку
//     oscillator.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
//     // Робимо плавне ковзання до кінцевої точки
//     oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
//
//     // Керування гучністю (плавне згасання)
//     gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
//
//     oscillator.connect(gainNode);
//     gainNode.connect(audioCtx.destination);
//
//     oscillator.start();
//     oscillator.stop(audioCtx.currentTime + duration);
//   };
//
//   const trigger = (action) => {
//     if ("vibrate" in navigator) {
//       switch (action) {
//         case 'vibrateOnly':
//           navigator.vibrate(30);
//           break;
//
//         case 'tick':
//           navigator.vibrate(20);
//           // Легкий "механічний" спад
//           playSweep(800, 600, 0.05, 0.001);
//           break;
//
//         case 'success':
//           navigator.vibrate([40, 30, 40]);
//           // Позитивний "вжух" угору
//           playSweep(1000, 2000, 0.2, 0.005);
//           break;
//
//         case 'remove':
//           navigator.vibrate(40);
//           // Низхідний тон — ефект видалення
//           playSweep(600, 200, 0.15, 0.005);
//           break;
//
//         case 'logout':
//           navigator.vibrate([50, 50, 50]);
//           // Довгий спад — ефект вимкнення пристрою
//           playSweep(800, 100, 0.4, 0.005);
//           break;
//
//         case 'error':
//           navigator.vibrate([50, 100, 50]);
//           // Важкий глухий звук
//           playSweep(400, 100, 0.3, 0.01);
//           break;
//
//         case 'copy':
//           navigator.vibrate(40);
//           // Короткий "цифровий" сигнал угору
//           playSweep(1200, 1400, 0.08, 0.05);
//           break;
//
//         default:
//           navigator.vibrate(30);
//       }
//     }
//   };
//
//   return {trigger};
// };