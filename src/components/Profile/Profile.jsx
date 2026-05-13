import styles from "./Profile.module.css";
import { useHaptics } from "../../hooks/useHaptics.js";
import { useAuth } from "../../context/AuthContext.jsx";

const Profile = ({session}) => {
  const {trigger} = useHaptics();
  const {logout} = useAuth(); // Беремо готову функцію виходу з нашої "CAN-шини"

  // Нагадую: зараз session — це вже готовий об'єкт юзера (з App.jsx)
  const user = session;

  if (!user) return null;

  // Безпечне отримання першої літери
  const avatarLetter = user.email ? user.email[0].toUpperCase() : "?";

  const handleLogoutClick = () => {
    trigger('logout'); // Вібровідгук
    logout(); // Викликаємо централізовану функцію виходу
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.userBadge}>
        <div className={styles.avatar}>{avatarLetter}</div>
        <span className={styles.email}>{user.email}</span>
      </div>
      <button onClick={handleLogoutClick} className={styles.logoutBtn}>
        Вийти
      </button>
    </div>
  );
};

export default Profile;