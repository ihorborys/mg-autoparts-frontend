import styles from './CatalogItem.module.css';


const CatalogItem = ({product}) => {
  console.log('Мій продукт:', product);

  // Визначаємо, який клас додати
  const stockColorClass = product.stock === 0
    ? styles.outOfStock    // Випадок 1: Немає в наявності (0)
    : product.stock < 5
      ? styles.lowStock    // Випадок 2: Закінчується (1-4 шт.)
      : styles.goodStock;  // Випадок 3: Багато (5+)

  return (
    <li className={styles.wrapper}>
      <div className={styles.container}>
        <section className={styles.sectionBrandCodeImg}>
          <h4 className={styles.brand}>{product.brand}</h4>
          <p className={styles.code}>{product.code}</p>
          <img className={styles.image} src="/img/catalog/no_item.png" alt="No picture available"/>
        </section>

        <section className={styles.section}>
          <p className={styles.name}>{product.name}</p>
        </section>

        <section className={styles.section}>
          <p className={`${styles.stock} ${stockColorClass}`}>
            {product.stock}
          </p>

          <p className={styles.price}>
            {product.price_eur}
          </p>
        </section>

      </div>

    </li>
  );
};

export default CatalogItem;