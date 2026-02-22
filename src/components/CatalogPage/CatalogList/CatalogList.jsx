import { useSelector } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem"; // Імпортуємо наш новий компонент


const CatalogList = () => {
  const {items, isLoading, error} = useSelector((state) => state.products);

  if (isLoading) return <Loader/>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

// 1. Стан: Користувач ще нічого не шукав
  if (!searchPerformed) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
        <h2>Вітаємо в магазині Maxgear! 🚗</h2>
        <p>Введіть артикул або назву запчастини, щоб почати пошук.</p>
      </div>
    );
  }

  // 2. Стан: Пошук відбувся, але масив порожній
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <img src="/img/catalog/no_item.png" alt="Немає результатів" style={{ width: '120px' }} />
        <h3>На жаль, за цим запитом нічого не знайдено 🔍</h3>
      </div>
    );
  }

  return (
    <ul style={{listStyle: "none", padding: 0}}>
      {items.map((product) => (
        // Ключ (key) ЗАВЖДИ має бути тут, у списку, а не всередині компонента
        <CatalogItem
          key={`${product.code}-${product.supplier_id}`}
          product={product}
        />
      ))}
    </ul>
  );
};

export default CatalogList;