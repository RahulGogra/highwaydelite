import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import type { Booking, Experience, Slot } from '../types';
import Header from '../components/Header';

// Define the expanded state interface
interface CheckoutState {
  experience: Experience;
  slot: Slot;
  date: string;
  quantity: number; // NEW
  total: number;    // NEW (pre-calculated total)
  basePrice: number; // NEW (base price)
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Destructure the new state variables
  const { experience, slot, date, quantity, total } = location.state as CheckoutState;

  // Derive prices from the passed state
  const basePrice = experience ? parseInt((experience as any).price) : 0; // Use 'price' from experience if needed
  const taxes = 59; 
  const subtotal = basePrice * quantity;
  
  const [form, setForm] = useState({ name: 'John Doe', email: 'test@test.com', promoCode: '' });
  const [discount, setDiscount] = useState<number>(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recalculate total dynamically only if a discount is applied
  const totalDue = useMemo(() => subtotal + taxes - discount, [subtotal, taxes, discount]);
  
  const handleValidatePromo = async () => {
    if (!form.promoCode) return;
    try {
      const res = await axiosClient.post('/promo/validate', {
        code: form.promoCode,
        cartValue: subtotal
      });
      if (res.data.valid) {
        setDiscount(res.data.discount);
        alert(`Promo applied: ₹${res.data.discount} off`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid promo code');
    }
  };

  const handleBook = async () => {
    if (!form.name || !form.email) return alert('Please fill your details');
    if (!termsAccepted) return alert('You must agree to the terms and safety policy.');
    
    setLoading(true);
    try {
      const payload: Booking = {
        experienceId: experience._id,
        slotId: slot._id,
        date,
        customerName: form.name,
        customerEmail: form.email,
        promoCode: form.promoCode,
        quantity, 
        totalPaid: totalDue, 
      };

      const res = await axiosClient.post('/bookings', payload);
      navigate('/confirmation', { state: { booking: res.data.data } });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => { /* Search logic */ };

  if (!experience || !slot || !date) {
    return (
      <div className="p-6 text-center">
        <p>No booking details found. Please return to the experience page.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-500">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-6">
            <span className="text-xl mr-2">←</span> Checkout
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: User Form */}
          <div className="lg:w-3/5">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Full Name Input */}
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="col-span-1 p-3 rounded-lg border focus:ring-yellow-400 focus:border-yellow-400 bg-gray-100 placeholder-gray-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  
                  {/* Email Input */}
                  <input
                    type="email"
                    placeholder="Email"
                    className="col-span-1 p-3 rounded-lg border focus:ring-yellow-400 focus:border-yellow-400 bg-gray-100 placeholder-gray-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />

                  {/* Promo Code Input & Button */}
                  <div className="col-span-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 p-3 rounded-lg border focus:ring-yellow-400 focus:border-yellow-400 bg-gray-100 placeholder-gray-500"
                      value={form.promoCode}
                      onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
                    />
                    <button
                      onClick={handleValidatePromo}
                      className="bg-gray-700 text-white px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Terms and Policy Checkbox */}
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the terms and safety policy
                  </label>
                </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary</h3>
                
                {/* Booking Details */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                        <span className="font-medium">Experience</span>
                        <span className="font-semibold text-gray-800">{experience.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Date</span>
                        <span>{date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Time</span>
                        <span>{slot.startTime} {slot.endTime && `- ${slot.endTime}`}</span>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Qty</span>
                    {/* Use the quantity passed from the previous page */}
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Taxes</span>
                    <span>₹{taxes}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm font-medium">
                      <span>Promo Discount</span>
                      <span>- ₹{discount}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold">₹{totalDue}</span>
                </div>

                <button
                  onClick={handleBook}
                  disabled={loading || !termsAccepted || totalDue <= 0}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold text-black transition-colors
                    ${loading || !termsAccepted || totalDue <= 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
                    }`}
                >
                  {loading ? 'Processing...' : 'Pay and Confirm'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;