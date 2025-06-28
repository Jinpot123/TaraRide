import React, { useEffect, useState } from "react";
import { auth, db, storage } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Account = () => {
  const [tab, setTab] = useState("profile");
  const [accountInfo, setAccountInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const accountRef = doc(db, "account_information", user.uid);
      const personalRef = doc(db, "personal_information", user.uid);

      const [accountSnap, personalSnap] = await Promise.all([
        getDoc(accountRef),
        getDoc(personalRef),
      ]);

      if (accountSnap.exists()) setAccountInfo(accountSnap.data());
      if (personalSnap.exists()) setPersonalInfo(personalSnap.data());
    };

    fetchInfo();
  }, []);

  useEffect(() => {
    if (!newPassword) return setPasswordStrength("");
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[\W_]/.test(newPassword);
    const isLong = newPassword.length >= 8;
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;

    if (score <= 2) setPasswordStrength("Weak");
    else if (score === 3 || score === 4) setPasswordStrength("Moderate");
    else setPasswordStrength("Strong");
  }, [newPassword]);

  const handleProfileSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    const uid = auth.currentUser.uid;
    const updates = {};

    try {
      if (profilePicFile) {
        const storageRef = ref(storage, `profile_pictures/${uid}`);
        await uploadBytes(storageRef, profilePicFile);
        const downloadURL = await getDownloadURL(storageRef);
        updates.profilePicImage = downloadURL;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "personal_information", uid), updates);
        setPersonalInfo((prev) => ({ ...prev, ...updates }));
      }

      alert("Profile updated!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile.");
    }

    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        alert("Please fill in all password fields.");
        setSaving(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        setSaving(false);
        return;
      }

      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!strongPasswordRegex.test(newPassword)) {
        alert("Password must be at least 8 characters long and include: uppercase, lowercase, number, special character.");
        setSaving(false);
        return;
      }

      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password: " + error.message);
    }

    setSaving(false);
  };

  if (!accountInfo || !personalInfo) {
    return <p className="p-6 text-center">Loading account info...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-6">
      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setTab("profile")}
          className={`px-4 py-2 rounded ${tab === "profile" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setTab("password")}
          className={`px-4 py-2 rounded ${tab === "password" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Change Password
        </button>
      </div>

      {tab === "profile" && (
        <div>
          <div className="flex flex-col items-center gap-4 mb-6">
            {personalInfo.profilePicImage ? (
              <img src={personalInfo.profilePicImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
                No Photo
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setProfilePicFile(e.target.files[0])} className="text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" value={personalInfo.first_name} />
            <Field label="Middle Name" value={personalInfo.middle_name} />
            <Field label="Last Name" value={personalInfo.last_name} />
            <Field label="Sex at Birth" value={personalInfo.sex_at_birth} />
            <Field
              label="Birth Date"
              value={personalInfo.birth_date?.seconds ? new Date(personalInfo.birth_date.seconds * 1000).toLocaleDateString() : ""}
            />
            <Field label="Email Address" value={accountInfo.email_address} />
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleProfileSave} disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "password" && (
        <div className="space-y-4">
          <PasswordField label="Old Password" value={oldPassword} onChange={setOldPassword} show={showOld} setShow={setShowOld} />
          <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} setShow={setShowNew} />

          {newPassword && (
            <div className="text-sm">
              <span className="font-medium">Strength:</span> <span className={`font-semibold ${passwordStrength === "Weak" ? "text-red-500" : passwordStrength === "Moderate" ? "text-yellow-500" : "text-green-600"}`}>{passwordStrength}</span>
              <div className="w-full h-2 bg-gray-200 rounded mt-1">
                <div
                  className={`h-2 rounded ${
                    passwordStrength === "Weak"
                      ? "bg-red-500 w-1/4"
                      : passwordStrength === "Moderate"
                      ? "bg-yellow-500 w-1/2"
                      : passwordStrength === "Strong"
                      ? "bg-green-500 w-full"
                      : ""
                  }`}
                ></div>
              </div>
            </div>
          )}

          <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} />
          <div className="flex justify-end">
            <button onClick={handlePasswordChange} disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
              {saving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value || ""}
      disabled
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
    />
  </div>
);

const PasswordField = ({ label, value, onChange, show, setShow }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border border-gray-300 shadow-sm pr-10 focus:ring-purple-500 focus:border-purple-500"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600 focus:outline-none"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

export default Account;
