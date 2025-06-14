import React, { useState } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DriverForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateImage, setPlateImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);  
  const [platePreview, setPlatePreview] = useState(null);
  const [vehiclePreview, setVehiclePreview] = useState(null);


  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'plate') {
        setPlateImage(file);
        setPlatePreview(URL.createObjectURL(file));
      } else if (type === 'vehicle'){
        setVehicleImage(file);
        setVehiclePreview(URL.createObjectURL(file));
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

      console.log('Submitting form with:', {
      name, email, mobileNumber, plateNumber, vehicleModel,
       plateImage, vehicleImage
     });

    try {
      const plateImageRef = ref(storage, `plateImages/${plateImage.name}`);
      const vehicleImageRef = ref(storage, `vehicleImages/${vehicleImage.name}`);

      console.log('plateImage:', plateImage);
      console.log('vehicleImage:', vehicleImage);



      await uploadBytes(plateImageRef, plateImage);
      await uploadBytes(vehicleImageRef, vehicleImage);


      const plateImageURL = await getDownloadURL(plateImageRef);
      const vehicleImageURL = await getDownloadURL(vehicleImageRef);

      await addDoc(collection(db, 'contact_information'), {
        name,
        email,
        mobileNumber,
        plateNumber,
        vehicleModel,
        plateImageURL,
        vehicleImageURL,
        createdAt: serverTimestamp()
      });

      alert('Driver submitted successfully!');


    } catch (error) {
      console.error('Error adding driver:', error);
      alert('Error submitting form.');
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Become a Driver</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email Address</label>
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
        
        {}
        <div>
          <label htmlFor="mobileNumber" className='block text-sm font-medium text-gray-600'>Mobile Number</label>
          <input
            id="mobileNumber"
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter your mobile number"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
        </div>

        {}
        <div>
          <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-600">Vehicle Model</label>
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

        {}
        <div>
          <label htmlFor="vehicleImage" className="block text-sm font-medium text-gray-600">Upload Vehicle Model Image</label>
          <input
            id="vehicleImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'vehicle')}
            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-md file:border-0 file:bg-blue-500 file:text-white file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {vehiclePreview && (
            <div className="mt-4">
              <img src={vehiclePreview} alt="Vehicle Preview" className="w-32 h-32 object-cover rounded-md" />
            </div>
          )}
        </div>

        {}
        <div>
          <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-600">Driver's Plate Number</label>
          <input
            id="plateNumber"
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="Enter your plate number"
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {}
        <div>
          <label htmlFor="plateImage" className="block text-sm font-medium text-gray-600">Upload Plate Number Image</label>
          <input
            id="plateImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'plate')}
            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-md file:border-0 file:bg-blue-500 file:text-white file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {platePreview && (
            <div className="mt-4">
              <img src={platePreview} alt="License Preview" className="w-32 h-32 object-cover rounded-md" />
            </div>
          )}
        </div>

        {}
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
