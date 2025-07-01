import React, { useState } from "react";
import { db, storage } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const DriverForm = () => {
  // Name fields now separated
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [plate_number, setPlate_number] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateImage, setPlateImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [platePreview, setPlatePreview] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "plate") {
        setPlateImage(file);
        setPlatePreview(URL.createObjectURL(file));
      } else if (type === "vehicle") {
        setVehicleImage(file);
        setVehiclePreview(URL.createObjectURL(file));
      } else if (type === "profile") {
        setProfileImage(file);
        setProfilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{11}$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!mobileRegex.test(mobileNumber)) {
      alert("Mobile number must be exactly 11 digits.");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase letters, numbers, and special characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userId = user.uid;

      await sendEmailVerification(user);

      const plateRef = ref(storage, `plateImages/${userId}_${plateImage.name}`);
      const vehicleRef = ref(
        storage,
        `vehicleImages/${userId}_${vehicleImage.name}`
      );
      const profileRef = ref(
        storage,
        `profilePictures/${userId}_${profileImage.name}`
      );

      await uploadBytes(plateRef, plateImage);
      await uploadBytes(vehicleRef, vehicleImage);
      await uploadBytes(profileRef, profileImage);

      const plateImageURL = await getDownloadURL(plateRef);
      const vehicleImageURL = await getDownloadURL(vehicleRef);
      const profileImageURL = await getDownloadURL(profileRef);

      const now = new Date();

      // CONTACT INFORMATION
      await setDoc(doc(db, "contact_information", userId), {
        uuid: userId,
        contact_name: `${firstName} ${middleName} ${lastName}`.trim(),
        email_address: email,
        mobile_number: mobileNumber,
        plate_number: plate_number,
        vehicle_model: vehicleModel,
        plate_image_url: plateImageURL,
        vehicle_image_url: vehicleImageURL,
        created_on: now,
      });

      // ACCOUNT INFORMATION
      await setDoc(doc(db, "account_information", userId), {
        uuid: userId,
        business_role: "driver",
        email_address: email,
        status: "idle",
        created_by: "tararide_automated_service",
        created_on: now,
        ride_id: "",
      });

      // PERSONAL INFORMATION
      await setDoc(doc(db, "personal_information", userId), {
        user_id: userId,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        sex_at_birth: gender,
        birth_date: new Date(dob),
        profilePicImage: profileImageURL,
      });

      alert("Account created! Please check your email for verification.");
      window.location.reload();
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Become a Driver
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-600"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Middle Name */}
        <div>
          <label
            htmlFor="middleName"
            className="block text-sm font-medium text-gray-600"
          >
            Middle Name
          </label>
          <input
            id="middleName"
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Enter your middle name"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-600"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-600"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-600"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-sm text-blue-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-600"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="mobileNumber"
            className="block text-sm font-medium text-gray-600"
          >
            Mobile Number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            inputMode="numeric"
            value={mobileNumber}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, ""); // remove non-digits
              if (cleaned.length <= 11) {
                setMobileNumber(cleaned);
              }
            }}
            placeholder="Enter your mobile number"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label
            htmlFor="vehicleModel"
            className="block text-sm font-medium text-gray-600"
          >
            Vehicle Model
          </label>
          <input
            id="vehicleModel"
            type="text"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            placeholder="Enter your vehicle's model"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-600"
          >
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dob"
            className="block text-sm font-medium text-gray-600"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="vehicleImage"
            className="block text-sm font-medium text-gray-600"
          >
            Upload Vehicle Model Image
          </label>
          <input
            id="vehicleImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "vehicle")}
            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-md file:border-0 file:bg-blue-500 file:text-white file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {vehiclePreview && (
            <div className="mt-4">
              <img
                src={vehiclePreview}
                alt="Vehicle Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="plate_number"
            className="block text-sm font-medium text-gray-600"
          >
            Driver's Plate Number
          </label>
          <input
            id="plate_number"
            type="text"
            value={plate_number}
            onChange={(e) => setPlate_number(e.target.value)}
            placeholder="Enter your plate number"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="plateImage"
            className="block text-sm font-medium text-gray-600"
          >
            Upload Plate Number Image
          </label>
          <input
            id="plateImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "plate")}
            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-md file:border-0 file:bg-blue-500 file:text-white file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {platePreview && (
            <div className="mt-4">
              <img
                src={platePreview}
                alt="License Preview"
                className="w-32 h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-600"
          >
            Upload Profile Picture
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "profile")}
            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-md file:border-0 file:bg-blue-500 file:text-white file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {profilePreview && (
            <div className="mt-4">
              <img
                src={profilePreview}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full border border-gray-300"
              />
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
