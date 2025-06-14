import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Kelgeen Jan L. Penilla",
    text: "TaraRide made my daily commute so much easier and cheaper!",
  },
  {
    name: "Peter John Detera",
    text: "As a driver, I save on gas and toll fees thanks to carpooling.",
  },
  {
    name: "Liam Lorenzo",
    text: "Reliable and convenient! Highly recommended for students.",
  },
];

const ReviewCarousel = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((current + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrent((current - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-semibold text-gray-900 mb-10">What Users Are Saying</h2>

        <div className="relative flex items-center justify-center">
          {/* Left arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-4 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Review content */}
          <div className="mx-12">
            <p className="text-xl text-gray-700 italic mb-4">"{reviews[current].text}"</p>
            <p className="font-medium text-lg text-gray-900">{reviews[current].name}</p>
          </div>

          {/* Right arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        {/* Bullets */}
        <div className="flex justify-center mt-8 space-x-4">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all ${
                index === current ? "bg-blue-600 scale-125" : "bg-gray-300"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewCarousel;
