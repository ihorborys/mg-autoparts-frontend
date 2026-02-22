import { useSelector } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem"; // Імпортуємо наш новий компонент


const CatalogList = () => {
  const {items, isLoading, error} = useSelector((state) => state.products);

  if (isLoading) return <Loader/>;
  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

// Якщо масив порожній (нічого не знайдено)
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
        {/* Використовуємо твою картинку-заглушку або сервіс */}
        <img
          src="/img/catalog/no_item.png"
          alt="Нічого не знайдено"
          style={{ width: '150px', opacity: 0.6, marginBottom: '20px' }}
          onError={(e) => { e.target.src = "https://placehold.co/150x150?text=No+Results"; }}
        />
        <h3 style={{ marginBottom: '10px' }}>Нічого не знайдено 🔍</h3>
        <p>Спробуйте інший артикул або назву деталі.</p>
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