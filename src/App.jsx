import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AboutUs from "./AboutUs";
import Contact from "./Contact";
import ErrorBoundary from "./ErrorBoundary";
import Success from "./Success";
import './index.css';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <Router>
        <div className="overflow-x-hidden antialiased text-neutral-800">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div data-aos="fade-up">
                    <Hero />
                  </div>
                  <div data-aos="fade-up" data-aos-delay="100">
                    <Services />
                  </div>
                  <div data-aos="fade-up" data-aos-delay="200">
                    <News />
                  </div>
                  <div data-aos="fade-up" data-aos-delay="300">
                    <ReviewCarousel />
                  </div>
                </>
              }
            />
            <Route path="/become-a-driver" element={<DriverForm />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
          
            <Route path="/home" element={<Hero />} />
            <Route path="/services" element={<Services />} />
            <Route path="/news" element={<News />} />
            <Route path="/success" element={<Success />} />
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
