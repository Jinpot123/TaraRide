import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "./LoadingScreen";
import { useLogout } from "./hooks/useLogout"; // ✅ Correct import only

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = useLogout(navigate, setLoggingOut); // ✅ Hook-based logout

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "account_information", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().business_role === "driver") {
            setIsDriver(true);
          } else {
            setIsDriver(false);
          }
        } catch (err) {
          console.error("Error checking business_role:", err);
          setIsDriver(false);
        }
      } else {
        setIsDriver(false);
      }

      setIsAuthLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthLoaded) return null;

  if (loggingOut) {
    return <LoadingScreen message="Logging out..." />;
  }

  const navLinks = isDriver ? (
    <>
      <Link to="/driver-dashboard" className="hover:text-blue-300 transition" onClick={closeMenu}>
        Dashboard
      </Link>
      <Link to="/account" className="hover:text-blue-300 transition" onClick={closeMenu}>
        Account
      </Link>
      <button
        onClick={handleLogout}
        className="hover:text-red-300 transition text-white"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/" className="hover:text-blue-300 transition" onClick={closeMenu}>
        Home
      </Link>
      <Link to="/about-us" className="hover:text-blue-300 transition" onClick={closeMenu}>
        About
      </Link>
      <Link to="/contact" className="hover:text-blue-300 transition" onClick={closeMenu}>
        Contact
      </Link>
      <Link to="/login" className="hover:text-blue-300 transition" onClick={closeMenu}>
        Login
      </Link>
    </>
  );

  return (
    <nav className="bg-purple-700 shadow-lg w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="text-xl font-bold text-white">
          <Link to="/" onClick={closeMenu}>
            TARARIDE
          </Link>
        </div>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-3xl text-white focus:outline-none"
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-lg text-white">{navLinks}</div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60" : "max-h-0"
        } px-6`}
      >
        <div className="flex flex-col py-2 text-xl text-gray-800 space-y-2">{navLinks}</div>
      </div>
    </nav>
  );
};

export default Navbar;
