import { Outlet } from "react-router-dom";
import Navigation from "../../components/Navigation/MainNav/Navigation.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";

const HomeLayout = () => {
  return (
    <div className="page-wrapper">
      <div>
        {/* Header тепер автономний і сам знає, як отримати дані користувача */}
        <Header/>
        <Navigation/>
      </div>
      <Outlet/>
      <Footer/>
    </div>
  );
};

export default HomeLayout;