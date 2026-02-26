import { RingLoader } from "react-spinners";
import styles from "./Loader.module.css";

const Loader = () => {
  const redColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--red")
    .trim();

  const greyColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--grey")
    .trim();

  const loaderSize = window.innerWidth < 768 ? 30 : 60;

  return (
    <div className={styles.loaderWrapper}>
      <RingLoader size={loaderSize} color={greyColor}/>
    </div>
  );
};
export default Loader;
