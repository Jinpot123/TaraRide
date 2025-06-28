import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import LoadingScreen from "./LoadingScreen";

const COLORS = ["#8b5cf6", "#6366f1", "#4f46e5", "#4338ca"];

const DriverDashboard = () => {
  const [driverName, setDriverName] = useState("");
  const [rides, setRides] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [statusFilter, setStatusFilter] = useState("completed");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "ride_information"),
      where("driver_id", "==", user.uid),
      where("status", "==", statusFilter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedRides = [];
      let totalEarned = 0;
      let driverNameTemp = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRides.push(data);
        totalEarned += data.ride_earnings || 0;
        if (!driverNameTemp && data.driver_name) {
          driverNameTemp = data.driver_name;
        }
      });

      setRides(fetchedRides);
      setEarnings(totalEarned);
      setDriverName(driverNameTemp || user.email);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  if (loggingOut) return <LoadingScreen message="Logging out..." />;

  const chartData = rides.map((ride) => ({
    title: ride.ride_title?.slice(0, 15) || "Untitled",
    earnings: ride.ride_earnings || 0,
  }));

  const rideTypeData = Object.entries(
    rides.reduce((acc, ride) => {
      const type = ride.ride_type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ name: type, value: count }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {driverName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
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
      </div>

      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2 font-medium">
          Filter by status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Earnings per Ride</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" angle={-30} textAnchor="end" interval={0} height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="earnings" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Rides by Type</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={rideTypeData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {rideTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h3 className="text-lg font-medium mb-2">Your Rides</h3>
      <ul className="space-y-3">
        {rides.map((ride, i) => (
          <li key={i} className="border p-4 rounded-md shadow-sm">
            <p className="font-semibold">{ride.ride_title || "Untitled Ride"}</p>
            {ride.ride_source_location_name && ride.ride_destination_name && (
              <p>
                From{" "}
                <span className="text-blue-600">{ride.ride_source_location_name}</span> to{" "}
                <span className="text-blue-600">{ride.ride_destination_name}</span>
              </p>
            )}
            <p>Earnings: ₱{(ride.ride_earnings || 0).toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DriverDashboard;
