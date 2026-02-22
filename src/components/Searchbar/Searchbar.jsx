import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProductsByQuery } from "../../redux/productsOps";
import styles from "./Searchbar.module.css";
import toast from 'react-hot-toast';


const Searchbar = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim() === "") {
      toast.error("Введіть артикул або бренд!", {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#333',
          color: '#fff',
        },
      });
      return; // Зупиняємо функцію, щоб dispatch не спрацював
    }

    dispatch(fetchProductsByQuery(query));
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введіть артикул або бренд (наприклад: 602000700 або Luk)"
      />
      <button type="submit" className={styles.button}>
        Пошук
      </button>
    </form>
  );
};

export default Searchbar;