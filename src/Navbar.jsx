import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-purple-700 shadow-lg w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
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
        <div className="hidden md:flex gap-6 text-lg text-white">
          <Link to="/" className="hover:text-blue-300 transition" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/about-us" className="hover:text-blue-300 transition" onClick={closeMenu}>
            About
          </Link>
          <Link to="/contact" className="hover:text-blue-300 transition" onClick={closeMenu}>
            Contact
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60" : "max-h-0"
        } px-6`}
      >
        <Link
          to="/"
          className="block py-2 text-xl !text-gray-800 hover:text-blue-600 transition-colors duration-200"
          onClick={closeMenu}
        >
          Home
        </Link>
        <Link
          to="/about-us"
          className="block py-2 text-xl !text-gray-800 hover:text-blue-600 transition-colors duration-200"
          onClick={closeMenu}
        >
          About
        </Link>
        <Link
          to="/contact"
          className="block py-2 text-xl !text-gray-800 hover:text-blue-600 transition-colors duration-200"
          onClick={closeMenu}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
