export const useHaptics = () => {

  const playSound = (soundName) => {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.2; // Робимо звук тихим, щоб не лякати
    audio.play().catch(() => {
    }); // catch, щоб не було помилок, якщо браузер блокує автоплей
  };

  const trigger = (action) => {
    if (!("vibrate" in navigator)) return;

    switch (action) {
      case 'success':
        navigator.vibrate(50);
        // playSound('pop'); // Розкоментуй, коли додаси файл звуку
        break;
      case 'tick':
        navigator.vibrate(30);
        // playSound('click');
        break;
      case 'error':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'copy':
        navigator.vibrate(40);
        break;
      default:
        navigator.vibrate(30);
    }
  };

  return {trigger};
};