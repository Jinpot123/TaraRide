import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Services from "./Services";
import News from "./News";
import DriverForm from "./DriverForm";
import ReviewCarousel from "./ReviewCarousel";
import LoadingScreen from "./LoadingScreen";
import Footer from "./Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import ErrorBoundary from "./ErrorBoundary";
import Success from "./Success";
import Login from "./Login";
import DriverDashboard from "./DriverDashboard";
import PrivateRoute from "./PrivateRoute";
import Account from "./Account";
import AboutUs from "./AboutUs";        // ✅ Make sure these are correctly imported
import Contact from "./Contact";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "./index.css";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <Router>
        <div className="overflow-x-hidden antialiased text-neutral-800">
          <Navbar />
          <Routes>
            {/* Homepage */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/driver-dashboard" replace />
                ) : (
                  <>
                    <div data-aos="fade-up"><Hero /></div>
                    <div data-aos="fade-up" data-aos-delay="100"><Services /></div>
                    <div data-aos="fade-up" data-aos-delay="200"><News /></div>
                    <div data-aos="fade-up" data-aos-delay="300"><ReviewCarousel /></div>
                  </>
                )
              }
            />

            {/* Public Routes */}
            {!user && (
              <>
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
              </>
            )}

            <Route path="/become-a-driver" element={<DriverForm />} />
            <Route path="/success" element={<Success />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/driver-dashboard" element={
              <PrivateRoute allowedRoles={["driver"]}>
                <DriverDashboard />
              </PrivateRoute>
            } />
            <Route path="/account" element={
              <PrivateRoute allowedRoles={["driver"]}>
                <Account />
              </PrivateRoute>
            } />
          </Routes>

          <div data-aos="fade-up" data-aos-delay="400">
            <Footer />
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
