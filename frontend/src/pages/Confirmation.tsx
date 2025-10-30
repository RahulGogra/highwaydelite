import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
// Assuming the Booking type includes a refId/reference property 
// and that the experience/customerName might not be directly available on the booking object 
// if the API only returns a minimal confirmation object.

const Confirmation: React.FC = () => {
  const { state } = useLocation();
  // We assume the successful booking response object is passed here, 
  // and it has an identifier like '_id' or 'refId'.
  const booking = state?.booking;
  const navigate = useNavigate();

  // Determine the reference ID. Use '_id' as a fallback if 'refId' isn't available.
  const referenceId = booking?.refId || booking?._id || 'N/A';

  if (!booking)
    return (
      <div className="text-center mt-20 text-gray-500">
        <p>No booking found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-yellow-400 rounded-md font-medium hover:bg-yellow-500"
        >
          Go Home
        </button>
      </div>
    );

  const handleSearch = () => {
    // Search logic here
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 text-center">
        
        {/* The green checkmark icon */}
        <CheckCircle className="text-green-500 mb-6" size={64} />
        
        {/* Title */}
        <h1 className="text-3xl font-semibold mt-4 text-gray-800">Booking Confirmed</h1>
        
        {/* Reference ID */}
        <p className="text-gray-600 mt-2 text-lg">
          Ref ID: <strong className="text-gray-900 font-medium">{referenceId.toUpperCase().substring(0, 10)}</strong>
        </p>

        {/* Back to Home Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm bg-gray-100 border border-gray-300 px-6 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-200"
          >
            Back to Home
          </button>
        </div>
        
        {/* NOTE: If you need to include the thank you message and details (like in your original code, but outside the image design), you can add it here */}
        {/*
        <p className="text-gray-600 mt-4 text-sm max-w-sm">
          Thank you, {booking.customerName || 'Customer'}! Your booking for {booking.experience?.name} is complete.
        </p>
        */}
      </div>
    </>
  );
};

export default Confirmation;