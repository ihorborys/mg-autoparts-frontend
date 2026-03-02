import { RingLoader } from "react-spinners";
import styles from "./Loader.module.css";

// Додаємо пропси size та color
const Loader = ({size, color}) => {

  // 1. Отримуємо кольори з CSS-змінних (залишаємо як запасний варіант)
  const greyColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--grey")
    .trim() || "#ccc"; // Додав дефолтний колір, якщо змінна не знайдена

  // 2. Визначаємо розмір:
  // Якщо ми передали size в пропсах — беремо його.
  // Якщо ні — використовуємо твою логіку з шириною вікна.
  const responsiveSize = window.innerWidth < 768 ? 30 : 60;
  const finalSize = size || responsiveSize;

  // 3. Визначаємо колір:
  // Якщо передали колір — беремо його, якщо ні — беремо сірий з CSS.
  const finalColor = color || greyColor;

  return (
    <div className={styles.loaderWrapper}>
      <RingLoader
        size={finalSize}
        color={finalColor}
      />
    </div>
  );
};

export default Loader;