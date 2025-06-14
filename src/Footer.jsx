import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react"; 
import { Link } from "react-router-dom"; 

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-blue-500">TaraRide</h2>
          <p className="text-gray-400 text-sm">
            A smarter, safer, and affordable way to commute. Join our carpooling community today!
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-blue-500">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/home" className="hover:text-white">Home</Link></li> {/* Corrected Link */}
            <li><Link to="/services" className="hover:text-white">Services</Link></li> {/* Corrected Link */}
            <li><Link to="/news" className="hover:text-white">News</Link></li> {/* Corrected Link */}
            <li><Link to="/become-a-driver" className="hover:text-white">Become a Driver</Link></li> {/* Corrected Link */}
          </ul>
        </div>

        {/* Social & Contact */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-blue-500">Follow Us</h3>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-white"><Facebook size={24} /></a>
            <a href="#" className="hover:text-white"><Twitter size={24} /></a>
            <a href="#" className="hover:text-white"><Instagram size={24} /></a>
          </div>
          <p className="text-gray-400 text-sm mt-4">Email: support@tararide.com</p>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} TaraRide. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
