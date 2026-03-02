import styles from "./LoadMoreBtn.module.css";
import Loader from "../Loader/Loader.jsx";

const LoadMoreBtn = ({onClick, isLoading}) => {
  return (
    <div className={styles.container}>
      {isLoading ? (
        <Loader size={30}/>
      ) : (
        <button
          className={styles.button}
          onClick={onClick}
          disabled={isLoading}
        >
          Показати ще
        </button>
      )}
    </div>
  );
};

export default LoadMoreBtn;