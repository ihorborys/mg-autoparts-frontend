import styles from "./Header.module.css";
import Container from "../../layouts/Container/Container.jsx";
import Address from "../Address/Address.jsx";
import Profile from "../Profile/Profile.jsx";

const Header = ({session}) => {
  console.log("Дані сесії у Хедері:", session);
  return (
    <header className={styles.wrapper}>
      <Container>
        <div className={styles.headerComponents}>
          <Address/>
          <Profile session={session}/>
        </div>

      </Container>
    </header>
  );
};

export default Header;
