import React from 'react';
import type { Experience, Slot } from '../types';

interface OrderSummaryProps {
  experience: Experience & { price: string }; // Assuming price is on experience
  selectedSlot: Slot | null;
  handleContinue: (quantity: number, total: number) => void; // Update handleContinue
  quantity: number;
  setQuantity: (q: number) => void;
  subtotal: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
    experience, 
    selectedSlot, 
    handleContinue, 
    quantity, 
    setQuantity,
    subtotal,
    total 
}) => {
  const basePrice = parseInt(experience.price);
  const taxes = 59; // taxes moved here for display

  const increase = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    // Calculations will now happen in the parent component (ExperienceDetails)
  }
  
  const decrease = () => {
    if (quantity === 1) { 
        alert("Quantity cannot be less than 1"); 
        return;
    }
    const newQuantity = quantity - 1;
    setQuantity(newQuantity);
  }

  // NOTE: The calculation logic for subtotal/total is now managed in the parent component 
  // and passed down, simplifying this component to just control quantity and display prices.

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-gray-500 mb-4 text-sm">Starts at</h3>
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <span className="text-xl font-bold">₹{basePrice}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Quantity</span>
          <div className="flex items-center">
            <button 
              className="text-lg px-2 rounded-full border border-gray-300 hover:bg-gray-200" 
              onClick={decrease}
            >–</button>
            <span className="mx-3">{quantity}</span>
            <button 
              className="text-lg px-2 rounded-full border border-gray-300 hover:bg-gray-200" 
              onClick={increase}
            >+</button>
          </div>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          {/* Use subtotal passed from parent */}
          <span>₹{subtotal}</span> 
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Taxes</span>
          <span>₹{taxes}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-300">
        <span className="text-xl font-bold">Total</span>
        {/* Use total passed from parent */}
        <span className="text-xl font-bold">₹{total}</span>
      </div>

      <button
        // Pass quantity and total when continuing
        onClick={() => handleContinue(quantity, total)} 
        disabled={!selectedSlot} 
        className={`w-full mt-6 py-3 rounded-lg font-semibold text-black transition-colors
          ${!selectedSlot
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-500 shadow-md'
          }`}
      >
        Confirm
      </button>
    </div>
  );
};

export default OrderSummary;