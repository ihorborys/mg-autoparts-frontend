import { Outlet } from "react-router-dom";
import Navigation from "../../components/Navigation/MainNav/Navigation.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import styles from "./CatalogLayout.module.css";

const CatalogLayout = () => {
  return (
    <div className="page-wrapper">
      <div className={styles.stickyHeader}>
        {/* Тепер Header сам знає, хто залогінений,
            тому ми не передаємо йому жодних пропсів */}
        <Header/>
        <Navigation/>
      </div>
      <Outlet/>
      <Footer/>
    </div>
  );
};

export default CatalogLayout;