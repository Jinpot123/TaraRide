import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "./LoadingScreen"; // ✅ your custom screen

const PrivateRoute = ({ children, allowedRoles = ["driver"] }) => {
  const [authUser, setAuthUser] = useState(null);
  const [roleAllowed, setRoleAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const docRef = doc(db, "account_information", user.uid); // You can extend this for "admins" or "passengers" later
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const role = userData.business_role;

          if (allowedRoles.includes(role)) {
            setAuthUser(user);
            setRoleAllowed(true);
          } else {
            setUnauthorized(true);
          }
        } else {
          setUnauthorized(true);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setUnauthorized(true);
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (checking) return <LoadingScreen />;

  if (unauthorized)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white p-6">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-lg text-gray-700 mb-6">
          You are not authorized to view this page.
        </p>
        <a
          href="/#/"
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go back to Home
        </a>
      </div>
    );

  return roleAllowed ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
