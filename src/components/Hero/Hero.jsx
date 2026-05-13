import styles from './Hero.module.css';
import Container from "../../layouts/Container/Container.jsx";
import { Link } from "react-router-dom";
import Button from "../Button/Button.jsx";

const Hero = () => {
  return (
    <section className={styles.wrapper}>
      <Container>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>Надійні комплектуючі для Вашого авто</h1>
            <h3 className={styles.subTitle}>
              Понад 1 000 000 позицій — від оригінальних деталей до якісних аналогів
            </h3>
            <Link to="/catalog">
              <Button>До каталогу</Button>
            </Link>

          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;


