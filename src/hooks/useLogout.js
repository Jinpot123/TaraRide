import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

export const useLogout = (navigate, setLoggingOut) => async () => {
  try {
    setLoggingOut(true);

    await signOut(auth);

    toast.success("Logged out successfully!");

    setLoggingOut(false);
    navigate("/");
  } catch (err) {
    console.error("Logout failed:", err);
    toast.error("Failed to logout. Please try again.");
    setLoggingOut(false);
  }
};
