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


export const useHaptics = () => {

  // Функція для створення короткого електронного "тіка"
  const playSyntheticTick = () => {
    try {
      // 1. Створюємо аудіо-контекст (двигун звуку)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();

      // 2. Створюємо осцилятор (генератор хвилі) та вузол гучності
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // 3. Налаштовуємо звук
      oscillator.type = 'sine'; // М'яка хвиля (чистий звук)
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // Висота (1000 Гц — це дзвінкий клік)

      // 4. Робимо звук дуже коротким (загасання)
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Початкова гучність (10%)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); // Згасає за 0.05 сек

      // 5. З'єднуємо все разом і в колонки
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // 6. Запуск і миттєва зупинка
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.error("AudioContext error:", e);
    }
  };

  const trigger = (action) => {
    // Вібрація (працює на Android)
    if ("vibrate" in navigator) {
      switch (action) {
        case 'tick':
          navigator.vibrate(20);
          playSyntheticTick(); // Граємо наш згенерований звук
          break;
        case 'success':
          navigator.vibrate(60);
          // Для успіху можна зробити звук трохи іншим, або просто вібрацію
          break;
        case 'error':
          navigator.vibrate([50, 100, 50]);
          break;
        default:
          navigator.vibrate(30);
      }
    }
  };

  return {trigger};
};