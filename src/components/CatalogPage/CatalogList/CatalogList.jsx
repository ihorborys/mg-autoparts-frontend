import { useSelector } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem"; // Імпортуємо наш новий компонент


const CatalogList = () => {
  const {items, isLoading, error, searchPerformed, lastQuery} = useSelector((state) => state.products);

  // Стан завантаження
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Loader />
        <p style={{ marginTop: '10px', color: '#666', fontStyle: 'italic' }}>
          Шукаємо: <strong>"{lastQuery}"</strong>...
        </p>
      </div>
    );
  }

  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

// 1. Стан: Користувач ще нічого не шукав
  if (!searchPerformed) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
        {/*<h2>Вітаємо в нашому магазині!</h2>*/}
      </div>
    );
  }

// Стан: Пошук завершено, але нічого не знайдено
  if (searchPerformed && items.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>На жаль, за запитом
          <p style={{ color: 'red'}}>"{lastQuery}"</p>
          нічого не знайдено</h3>
        <br></br>
        <p style={{ fontStyle: 'italic'}}>Спробуйте інший артикул або перевірте розкладку клавіатури.</p>
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