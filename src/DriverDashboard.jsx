import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import LoadingScreen from "./LoadingScreen";

const DriverDashboard = () => {
  const [driverName, setDriverName] = useState("");
  const driverNameCache = useRef("");
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loggingOut, setLoggingOut] = useState(false);

  const navigate = useNavigate();

  const getMonthRange = (year, month) => {
    const start = new Date(year, month, 1, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
  };

  useEffect(() => {
    const fetchDriverNameFromContactInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const contactRef = doc(db, "contact_information", user.uid);
        const contactSnap = await getDoc(contactRef);

        if (contactSnap.exists()) {
          const data = contactSnap.data();
          const fullName = `${data.contact_name || "TaraRide Driver"}`;
          setDriverName(fullName);
          driverNameCache.current = fullName;
        } else {
          setDriverName("TaraRide Driver");
        }
      } catch (error) {
        console.error("Error fetching driver name:", error);
        setDriverName("TaraRide Driver");
      }
    };

    fetchDriverNameFromContactInfo();
  }, []);

  useEffect(() => {
    const fetchRidesAndFeedbacks = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const { start, end } = getMonthRange(selectedYear, selectedMonth);

      try {
        const ridesSnapshot = await getDocs(
          query(
            collection(db, "ride_information"),
            where("driver_id", "==", user.uid),
            where("status", "==", "completed")
          )
        );
        const allDriverRides = ridesSnapshot.docs.map((doc) => doc.data());
        const rideMap = new Map(allDriverRides.map((r) => [r.ride_id, r]));

        const historiesSnap = await getDocs(
          collection(db, "ride_history_information")
        );
        const matchedRideIds = new Set();

        historiesSnap.docs.forEach((doc) => {
          const data = doc.data();
          const completedAt = data.ride_completed_at?.toDate?.();
          if (
            rideMap.has(data.ride_id) &&
            completedAt &&
            completedAt >= start &&
            completedAt <= end
          ) {
            matchedRideIds.add(data.ride_id);
          }
        });

        const filteredRides = Array.from(matchedRideIds).map((id) =>
          rideMap.get(id)
        );
        const rideIds = filteredRides.map((r) => r.ride_id);

        const totalEarnings = filteredRides.reduce(
          (sum, ride) => sum + (ride.ride_earnings || 0),
          0
        );
        setEarnings(totalEarnings);

        const feedbackSnap = await getDocs(
          collection(db, "feedback_information")
        );
        const allFeedbacks = feedbackSnap.docs.map((doc) => doc.data());

        const feedbacksByRideId = {};
        const ratings = [];

        allFeedbacks.forEach((fb) => {
          if (rideIds.includes(fb.ride_id) && typeof fb.feedback_rating === "number") {
            if (!feedbacksByRideId[fb.ride_id]) feedbacksByRideId[fb.ride_id] = [];
            feedbacksByRideId[fb.ride_id].push(fb.feedback_rating);
            ratings.push(fb.feedback_rating);
          }
        });

        const avg =
          ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
            : null;
        setAverageRating(avg);
        setRatingCount(ratings.length);

        const distribution = {};
        ratings.forEach((r) => {
          const rounded = Math.round(r);
          distribution[rounded] = (distribution[rounded] || 0) + 1;
        });
        setRatingDistribution(distribution);

        const passengerCounts = {};
        historiesSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (matchedRideIds.has(data.ride_id)) {
            passengerCounts[data.ride_id] = (passengerCounts[data.ride_id] || 0) + 1;
          }
        });

        const enrichedRides = filteredRides.map((ride) => ({
          ...ride,
          passenger_count: passengerCounts[ride.ride_id] || 0,
          average_rating:
            feedbacksByRideId[ride.ride_id] && feedbacksByRideId[ride.ride_id].length
              ? (
                  feedbacksByRideId[ride.ride_id].reduce((a, b) => a + b, 0) /
                  feedbacksByRideId[ride.ride_id].length
                ).toFixed(2)
              : null,
        }));
        setRides(enrichedRides);

        const sortedFeedbacks = allFeedbacks
          .filter((fb) => rideIds.includes(fb.ride_id))
          .sort(
            (a, b) =>
              b.feedback_submitted_on?.seconds - a.feedback_submitted_on?.seconds
          )
          .slice(0, 3);
        setRecentFeedbacks(sortedFeedbacks);
      } catch (err) {
        console.error("Error fetching ride or feedback data:", err);
        setRides([]);
        setEarnings(0);
        setAverageRating(null);
        setRatingCount(0);
        setRecentFeedbacks([]);
        setRatingDistribution({});
      }
    };

    fetchRidesAndFeedbacks();
  }, [selectedMonth, selectedYear]);

  const chartData = rides.map((ride) => ({
    title: ride.ride_title?.slice(0, 15) || "Untitled",
    earnings: ride.ride_earnings || 0,
  }));

  const renderStars = (avg) => {
    const fullStars = Math.floor(avg);
    const halfStar = avg % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i}>⭐</span>);
    }
    if (halfStar) {
      stars.push(<span key="half">⭐</span>);
    }
    return stars;
  };

  if (loggingOut) return <LoadingScreen message="Logging out..." />;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {driverName}
      </h1>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 rounded border"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 rounded border"
          >
            {yearOptions.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
        <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
          <p className="text-sm text-gray-600">Total Rides</p>
          <p className="text-2xl font-bold">{rides.length}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold">₱{earnings.toFixed(2)}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
          <p className="text-sm text-gray-600">Avg. per Ride</p>
          <p className="text-2xl font-bold">
            ₱{rides.length > 0 ? (earnings / rides.length).toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg text-center shadow">
          <p className="text-sm text-gray-600">Avg. Rating</p>
          <p className="text-2xl font-bold">
            {averageRating !== null ? (
              <>
                {averageRating} / 5 <br />
                <span className="text-yellow-500">
                  {renderStars(Number(averageRating))}
                </span>
              </>
            ) : (
              "No ratings yet"
            )}
          </p>
          {ratingCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">{ratingCount} ratings</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">💰 Earnings per Ride</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="title"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earnings" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No earnings data for this month.</p>
        )}
      </div>

      {recentFeedbacks.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">💬 Latest Feedback</h3>
          <ul className="space-y-4">
            {recentFeedbacks.map((fb, i) => (
              <li key={i} className="border p-3 rounded-md shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-700">
                    {renderStars(fb.feedback_rating)} ({fb.feedback_rating})
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(
                      fb.feedback_submitted_on?.seconds * 1000
                    ).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-800 mt-1">"{fb.feedback_comment}"</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">
          🌟 Feedback Rating Distribution
        </h3>
        <ul className="space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => (
            <li key={stars} className="flex justify-between items-center">
              <span>{"⭐".repeat(stars)}</span>
              <span>{ratingDistribution[stars] || 0} ratings</span>
            </li>
          ))}
        </ul>
      </div>

      <h3 className="text-lg font-medium mb-2">Your Rides</h3>
      {rides.length > 0 ? (
        <ul className="space-y-3">
          {rides.map((ride, i) => (
            <li key={i} className="border p-4 rounded-md shadow-sm">
              <p className="font-semibold">
                {ride.ride_title || "Untitled Ride"}
              </p>
              {ride.ride_source_location_name &&
                ride.ride_destination_name && (
                  <p>
                    From{" "}
                    <span className="text-blue-600">
                      {ride.ride_source_location_name}
                    </span>{" "}
                    to{" "}
                    <span className="text-blue-600">
                      {ride.ride_destination_name}
                    </span>
                  </p>
                )}
              <p>Passengers: {ride.passenger_count}</p>
              <p>
                Avg. Ride Rating:{" "}
                {ride.average_rating ? (
                  <>
                    {ride.average_rating} / 5{" "}
                    <span className="text-yellow-500">
                      {renderStars(Number(ride.average_rating))}
                    </span>
                  </>
                ) : (
                  "No ratings"
                )}
              </p>
              <p>Earnings: ₱{(ride.ride_earnings || 0).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No rides found for this month.</p>
      )}
    </div>
  );
};

export default DriverDashboard;
