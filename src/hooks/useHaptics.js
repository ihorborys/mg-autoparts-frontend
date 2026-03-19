// export const useHaptics = () => {
//
//   const playSound = (soundName) => {
//     const audio = new Audio(`/sounds/${soundName}.mp3`);
//     audio.volume = 0.2; // Робимо звук тихим, щоб не лякати
//     audio.play().catch(() => {
//     }); // catch, щоб не було помилок, якщо браузер блокує автоплей
//   };
//
//   const trigger = (action) => {
//     if (!("vibrate" in navigator)) return;
//
//     switch (action) {
//       case 'success':
//         navigator.vibrate(50);
//         // playSound('pop'); // Розкоментуй, коли додаси файл звуку
//         break;
//       case 'tick':
//         navigator.vibrate(30);
//         // playSound('click');
//         break;
//       case 'error':
//         navigator.vibrate([50, 100, 50]);
//         break;
//       case 'copy':
//         navigator.vibrate(40);
//         break;
//       default:
//         navigator.vibrate(30);
//     }
//   };
//
//   return {trigger};
// };


// export const useHaptics = () => {
//
//   // Функція для створення короткого електронного "тіка"
//   const playSyntheticTick = () => {
//     try {
//       // 1. Створюємо аудіо-контекст (двигун звуку)
//       const AudioContext = window.AudioContext || window.webkitAudioContext;
//       const audioCtx = new AudioContext();
//
//       // 2. Створюємо осцилятор (генератор хвилі) та вузол гучності
//       const oscillator = audioCtx.createOscillator();
//       const gainNode = audioCtx.createGain();
//
//       // 3. Налаштовуємо звук
//       oscillator.type = 'sine'; // М'яка хвиля (чистий звук)
//       oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // Висота (1000 Гц — це дзвінкий клік)
//
//       // 4. Робимо звук дуже коротким (загасання)
//       gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Початкова гучність (10%)
//       gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // Згасає за 0.05 сек
//
//       // 5. З'єднуємо все разом і в колонки
//       oscillator.connect(gainNode);
//       gainNode.connect(audioCtx.destination);
//
//       // 6. Запуск і миттєва зупинка
//       oscillator.start();
//       oscillator.stop(audioCtx.currentTime + 0.05);
//     } catch (e) {
//       console.error("AudioContext error:", e);
//     }
//   };
//
//   const trigger = (action) => {
//     // Вібрація (працює на Android)
//     if ("vibrate" in navigator) {
//       switch (action) {
//         case 'tick':
//           navigator.vibrate(20);
//           playSyntheticTick(); // Граємо наш згенерований звук
//           break;
//         case 'success':
//           navigator.vibrate(60);
//           // Для успіху можна зробити звук трохи іншим, або просто вібрацію
//           break;
//         case 'error':
//           navigator.vibrate([50, 100, 50]);
//           break;
//         default:
//           navigator.vibrate(30);
//       }
//     }
//   };
//
//   return {trigger};
// };


// // 1. Створюємо контекст ОДИН РАЗ поза хуком
// // Це гарантує, що у нас завжди буде лише один аудіо-двигун
// const AudioContext = window.AudioContext || window.webkitAudioContext;
// const audioCtx = AudioContext ? new AudioContext() : null;
//
// export const useHaptics = () => {
//
//   const playSyntheticTick = () => {
//     if (!audioCtx) return;
//
//     // 2. Якщо браузер "приспав" звук (автоплей-захист), розбудимо його
//     if (audioCtx.state === 'suspended') {
//       audioCtx.resume();
//     }
//
//     // 3. Створюємо тільки вузли генерації звуку (вони дешеві)
//     const oscillator = audioCtx.createOscillator();
//     const gainNode = audioCtx.createGain();
//
//     oscillator.type = 'sine';
//     oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
//
//     // Робимо звук дуже коротким
//     gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
//
//     oscillator.connect(gainNode);
//     gainNode.connect(audioCtx.destination);
//
//     oscillator.start();
//     oscillator.stop(audioCtx.currentTime + 0.05);
//
//     // Вузли oscillator автоматично видаляються після зупинки
//   };
//
//   const trigger = (action) => {
//     if ("vibrate" in navigator) {
//       switch (action) {
//         case 'tick':
//           navigator.vibrate(20);
//           playSyntheticTick(); // Тепер це працює стабільно
//           break;
//         case 'success':
//           navigator.vibrate(60);
//           break;
//         case 'error':
//           navigator.vibrate([50, 100, 50]);
//           break;
//         default:
//           navigator.vibrate(30);
//       }
//     }
//   };
//
//   return {trigger};
// };

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
        case 'tick':
          navigator.vibrate(20);
          playTone(800, 0.05, 0.08); // Короткий низький клік
          break;

        case 'success':
          // Подвійна вібрація для "тріумфу"
          navigator.vibrate([40, 30, 40]);
          // Високий "позитивний" тон
          playTone(1500, 0.2, 0.1);
          break;

        case 'error':
          navigator.vibrate([50, 100, 50]);
          playTone(200, 0.3, 0.1); // Низький "гул" помилки
          break;

        case 'copy':
          navigator.vibrate(40);
          playTone(1200, 0.08, 0.05); // Тонкий цифровий відгук
          break;
      }
    }
  };

  return {trigger};
};