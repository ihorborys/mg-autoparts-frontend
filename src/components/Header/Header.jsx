import styles from "./Header.module.css";
import Container from "../../layouts/Container/Container.jsx";
import Address from "../Address/Address.jsx";
import Profile from "../Profile/Profile.jsx";
import CartIcon from "../CartIcon/CartIcon.jsx";
import { useAuth } from "../../context/AuthContext.jsx"; // Імпортуємо наш хук

const Header = () => {
  // Тепер Header сам бере дані користувача
  const {user} = useAuth();

  return (
    <header className={styles.wrapper}>
      <Container>
        <div className={styles.headerComponents}>
          <Address/>
          <div className={styles.userActions}>
            {/* Передаємо отриманого юзера в Profile */}
            <Profile session={user}/>
            <CartIcon/>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;