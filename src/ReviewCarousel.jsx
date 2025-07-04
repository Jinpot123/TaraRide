import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Shuffle utility
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Format timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const feedbackRef = collection(db, "feedback_information");
        const feedbackQuery = query(feedbackRef, where("feedback_rating", ">=", 4));
        const feedbackSnapshot = await getDocs(feedbackQuery);

        const allReviews = [];

        for (const feedbackDoc of feedbackSnapshot.docs) {
          const feedback = feedbackDoc.data();
          const { ride_id, passenger_id, feedback_comment, feedback_rating, feedback_submitted_on } = feedback;

          if (!ride_id || !passenger_id || !feedback_comment) continue;

          // Get ride title
          const rideDoc = await getDoc(doc(db, "ride_information", ride_id));
          const ride_title = rideDoc.exists() ? rideDoc.data().ride_title : "Ride Info";

          // Get passenger account and contact
          const accountDoc = await getDoc(doc(db, "account_information", passenger_id));
          let passengerName = "Anonymous";

          if (accountDoc.exists()) {
            const accountData = accountDoc.data();
            const contactDoc = await getDoc(doc(db, "contact_information", accountData.uuid));
            if (contactDoc.exists()) {
              const contactData = contactDoc.data();
              passengerName = contactData.contact_name || "Anonymous";
            }
          }

          allReviews.push({
            name: passengerName,
            text: feedback_comment,
            rating: feedback_rating,
            rideTitle: ride_title,
            date: formatDate(feedback_submitted_on),
          });
        }

        // Shuffle and limit to 5
        const randomFive = shuffleArray(allReviews).slice(0, 5);
        setReviews(randomFive);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const nextSlide = () => {
    if (reviews.length === 0) return;
    setCurrent((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    if (reviews.length === 0) return;
    setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="py-16 bg-gray-50 text-center">
        <h2 className="text-4xl font-semibold text-gray-900">What Users Are Saying</h2>
        <p className="mt-6 text-gray-600">No reviews available yet.</p>
      </section>
    );
  }

  const { name, text, rating, rideTitle, date } = reviews[current];

  return (
    <section id="reviews" className="py-16 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-10">
          What Users Are Saying
        </h2>

        <div className="relative flex flex-col sm:flex-row items-center justify-center">
          <button
            onClick={prevSlide}
            className="absolute sm:left-4 top-1/2 -translate-y-1/2 p-3 hidden sm:flex rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="mx-4 sm:mx-12 max-w-lg sm:max-w-2xl px-6 py-6 bg-white rounded-xl shadow-md text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h4 className="text-lg font-semibold text-blue-700">{rideTitle}</h4>
              <span className="text-sm text-gray-500">{date}</span>
            </div>
            <p className="text-base sm:text-lg text-gray-700 italic mb-3">
              "{text}"
            </p>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">— {name}</span>
              <span className="text-yellow-500 text-lg">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)}
              </span>
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="absolute sm:right-4 top-1/2 -translate-y-1/2 p-3 hidden sm:flex rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="flex justify-center mt-8 space-x-3">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
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
