import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger icon and close icon

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-lg w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="text-xl font-bold text-gray-800">
          <Link to="/" onClick={closeMenu} className="text-gray-800 hover:text-blue-600 transition">
            TaraRide
          </Link>
        </div>

        {/* Hamburger Button for Mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-3xl text-gray-800 focus:outline-none"
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menu (desktop) */}
        <div className="hidden md:flex gap-6 text-lg">
          <Link to="/" className="text-gray-800 hover:text-blue-600 transition" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about-us" className="text-gray-800 hover:text-blue-600 transition" onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" className="text-gray-800 hover:text-blue-600 transition" onClick={closeMenu}>
            Contact
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-white p-6 absolute top-16 left-0 right-0 shadow-lg z-10 transition-all duration-300`}
      >
        <Link
          to="/"
          className="block py-2 text-xl text-gray-800 hover:text-blue-600 transition"
          onClick={closeMenu}
        >
          Home
        </Link>
        <Link
          to="/about-us"
          className="block py-2 text-xl text-gray-800 hover:text-blue-600 transition"
          onClick={closeMenu}
        >
            About
        </Link>
        <Link
          to="/contact"
          className="block py-2 text-xl text-gray-800 hover:text-blue-600 transition"
          onClick={closeMenu}
        >
            Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
