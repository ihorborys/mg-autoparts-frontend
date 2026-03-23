import styles from "./Header.module.css";
import Container from "../../layouts/Container/Container.jsx";
import Address from "../Address/Address.jsx";
import Profile from "../Profile/Profile.jsx";
import CartIcon from "../CartIcon/CartIcon.jsx";

const Header = ({session}) => {
  return (
    <header className={styles.wrapper}>
      <Container>
        <div className={styles.headerComponents}>
          <Address/>
          <div className={styles.userActions}>
            <Profile session={session}/>
            <CartIcon/>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
