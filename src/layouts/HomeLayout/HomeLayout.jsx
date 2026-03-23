import { Outlet } from "react-router-dom";
import Navigation from "../../components/Navigation/MainNav/Navigation.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";

const HomeLayout = ({session}) => {
  return (
    <div className="page-wrapper">
      <div>
        <Header session={session}/>
        <Navigation/>
      </div>
      <Outlet/>
      <Footer/>
    </div>
  );
};

export default HomeLayout;
