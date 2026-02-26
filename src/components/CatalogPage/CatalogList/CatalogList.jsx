// import { useSelector } from "react-redux";
// import Loader from "../../Loader/Loader.jsx";
// import CatalogItem from "../CatalogItem/CatalogItem"; // Імпортуємо наш новий компонент
//
//
// const CatalogList = () => {
//   const {items, isLoading, error, searchPerformed, lastQuery} = useSelector((state) => state.products);
//
//   // Стан завантаження
//   if (isLoading) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '30px' }}>
//         <Loader />
//         <p style={{ marginTop: '10px', color: '#666', fontStyle: 'italic' }}>
//           Шукаємо: <strong>"{lastQuery}"</strong>...
//         </p>
//       </div>
//     );
//   }
//
//   if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;
//
// // 1. Стан: Користувач ще нічого не шукав
//   if (!searchPerformed) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>
//         {/*<h2>Вітаємо в нашому магазині!</h2>*/}
//       </div>
//     );
//   }
//
// // Стан: Пошук завершено, але нічого не знайдено
//   if (searchPerformed && items.length === 0) {
//     return (
//       <div style={{ textAlign: 'center', marginTop: '50px' }}>
//         <h3>На жаль, за запитом
//           <p style={{ color: 'red'}}>"{lastQuery}"</p>
//           нічого не знайдено</h3>
//         <br></br>
//         <p style={{ fontStyle: 'italic'}}>Спробуйте інший артикул або перевірте розкладку клавіатури.</p>
//       </div>
//     );
//   }
//
//   return (
//     <ul style={{listStyle: "none", padding: 0}}>
//       {items.map((product) => (
//         // Ключ (key) ЗАВЖДИ має бути тут, у списку, а не всередині компонента
//         <CatalogItem
//           key={`${product.code}-${product.supplier_id}`}
//           product={product}
//         />
//       ))}
//     </ul>
//   );
// };
//
// export default CatalogList;


import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loader from "../../Loader/Loader.jsx";
import CatalogItem from "../CatalogItem/CatalogItem";

const CatalogList = () => {
  const {items, isLoading, error, searchPerformed, lastQuery} = useSelector((state) => state.products);

  // 1. Додаємо стан для курсу
  const [exchangeRate, setExchangeRate] = useState(52); // Fallback 52 за замовчуванням
  const [isRateLoading, setIsRateLoading] = useState(true);

  // 2. Отримуємо курс з твого нового роута на бекенді
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Заміни на свій реальний URL на Render, коли задеплоїш
        const response = await fetch('https://mg-autoparts-backend.onrender.com/api/get-rate');
        const data = await response.json();
        setExchangeRate(data.rate);
      } catch (err) {
        console.error("Не вдалося отримати курс, використовуємо запасний:", err);
      } finally {
        setIsRateLoading(false);
      }
    };

    fetchRate();
  }, []);

  // Стан завантаження (чекаємо і товари, і курс)
  if (isLoading || isRateLoading) {
    return (
      <div style={{textAlign: 'center', marginTop: '30px'}}>
        <Loader color="red" size={40}/>
        <p style={{marginTop: '10px', color: '#666', fontStyle: 'italic'}}>
          {isLoading ? `Шукаємо: "${lastQuery}"...` : "Оновлюємо курс валют..."}
        </p>
      </div>
    );
  }

  if (error) return <p style={{color: 'red', textAlign: 'center'}}>Помилка: {error}</p>;

  if (!searchPerformed) {
    return <div style={{textAlign: 'center', marginTop: '40px', color: '#888'}}></div>;
  }

  if (searchPerformed && items.length === 0) {
    return (
      <div style={{textAlign: 'center', marginTop: '50px'}}>
        <h3>На жаль, за запитом <span style={{color: 'red'}}>"{lastQuery}"</span> нічого не знайдено</h3>
        <p style={{fontStyle: 'italic', marginTop: '10px'}}>Спробуйте інший артикул або перевірте розкладку
          клавіатури.</p>
      </div>
    );
  }

  return (
    <ul style={{listStyle: "none", padding: 0}}>
      {items.map((product) => (
        <CatalogItem
          key={`${product.code}-${product.supplier_id}`}
          product={product}
          exchangeRate={exchangeRate} // 3. Передаємо курс в кожну картку
        />
      ))}
    </ul>
  );
};

export default CatalogList;