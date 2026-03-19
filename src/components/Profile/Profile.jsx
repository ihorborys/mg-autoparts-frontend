import styles from "./Profile.module.css";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import { useHaptics } from "../../hooks/useHaptics.js"; // 1. Імпортуємо наш хук

const Profile = ({session}) => {
  const {trigger} = useHaptics(); // 2. Підключаємо "пульт"
  const user = session?.user;
  if (!user) return null; // Якщо юзера немає, нічого не показуємо

  const avatarLetter = user.email[0].toUpperCase();

  const handleLogout = async () => {
    trigger('logout');
    const {error} = await supabase.auth.signOut();
    if (error) toast.error("Помилка виходу");
    else toast.success("До зустрічі!");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.userBadge}>
        <div className={styles.avatar}>{avatarLetter}</div>
        <span className={styles.email}>{user.email}</span>
      </div>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Вийти
      </button>
    </div>
  );
};

export default Profile;