import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import type { Experience, Slot } from '../types';
import Header from '../components/Header';
import OrderSummary from '../components/OrderSummary';
import { ArrowLeft } from 'lucide-react';

// Define taxes here for centralized calculation
const TAX_RATE = 59; 

// Interface to store both display and API format for the dates
interface DateOption {
    display: string; // e.g., "Oct 29"
    apiValue: string; // e.g., "2025-10-29"
}

const ExperienceDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  // Change selectedDate to hold the API-friendly string
  const [selectedApiDate, setSelectedApiDate] = useState<string>(''); 
  const [availableDates, setAvailableDates] = useState<DateOption[]>([]); // Array of objects
  
  // Manage quantity and calculations
  const [quantity, setQuantity] = useState(1);
  const basePrice = experience ? parseInt((experience as any).price) : 0;
  const subtotal = useMemo(() => basePrice * quantity, [basePrice, quantity]);
  const total = useMemo(() => subtotal + TAX_RATE, [subtotal]);

  useEffect(() => {
    // --- START Date Generation Logic ---
    const dateOptions: DateOption[] = [];
    const today = new Date();
    
    // Function to format date as YYYY-MM-DD
    const formatDateForApi = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate dates for today and the next 4 days (5 days total)
    for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        dateOptions.push({
            display: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            apiValue: formatDateForApi(d),
        });
    }
    
    setAvailableDates(dateOptions);
    if (dateOptions.length > 0) {
        // Automatically select the first date's API value
        setSelectedApiDate(dateOptions[0].apiValue); 
    }
    // --- END Date Generation Logic ---


    axiosClient.get(`/experiences/${id}`).then((res) => {
      const experienceData = res.data.data || res.data; 
      setExperience(experienceData);
    });
  }, [id]);


  // UPDATE: handleContinue uses selectedApiDate
  const handleContinue = (finalQuantity: number, finalTotal: number) => {
    if (!selectedSlot || !selectedApiDate) return alert('Please select a date and time slot');
    navigate('/checkout', {
      state: {
        experience,
        slot: selectedSlot,
        date: selectedApiDate, // Use the YYYY-MM-DD format here
        quantity: finalQuantity, 
        total: finalTotal,       
        basePrice: basePrice     
      },
    });
  };

  const handleSearch = () => { /* Search logic */ };

  if (!experience) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  
  // Find the currently selected display date for styling
  // const currentDisplayDate = availableDates.find(d => d.apiValue === selectedApiDate)?.display;

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} />
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="border-b border-gray-100 py-2"> 
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-900 hover:text-gray-700 transition-colors"
            >
                {/* Icon is ArrowLeft, size 30px (h-8 w-8) for prominence */}
                <ArrowLeft size={20} className="mr-2" /> 
                
                {/* Title text, using bold/large font to match the image */}
                <span className="text-1rem font-semibold text-center align-middle ">Details</span> 
            </button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Details and Booking */}
          <div className="lg:w-2/3">
            <img 
              src={`/${experience.imageUrl}`}
              alt={experience.name} 
              className="w-full h-96 object-cover rounded-xl shadow-lg" 
            />
            
            <div className="mt-6">
              <h1 className="text-3xl font-bold">{experience.name}</h1>
              <p className="text-gray-600 mt-2">{experience.description}</p>
            </div>

            {/* Date Selection Tabs */}
            <div className="mt-8">
              <label className="font-semibold block mb-3 text-lg">Choose date</label>
              <div className="flex gap-2">
                {availableDates.map((dateOption) => (
                  <button
                    key={dateOption.apiValue}
                    // Set the API date value on click
                    onClick={() => setSelectedApiDate(dateOption.apiValue)} 
                    className={`px-4 py-2 text-sm rounded-lg border 
                      ${selectedApiDate === dateOption.apiValue 
                        ? 'bg-yellow-400 border-yellow-400 text-black font-semibold' 
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                  >
                    {/* Display the friendly format */}
                    {dateOption.display.split(' ')[0]} <span className="font-semibold">{dateOption.display.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="mt-8">
              <label className="font-semibold block mb-3 text-lg">Choose time</label>
              <div className="flex flex-wrap gap-3">
    {experience.slots.map((slot) => (
        <button
            key={slot._id}
            disabled={slot.availableSeats <= 0}
            onClick={() => setSelectedSlot(slot)}
            // Adjusted className for the inner contents to be flex
            className={`p-3 border rounded-lg text-sm transition-colors duration-150 flex items-center gap-2
                ${selectedSlot?._id === slot._id
                    ? 'bg-yellow-400 border-yellow-500 text-black font-semibold'
                    : 'bg-white border-gray-300 hover:border-yellow-400'
                } 
                ${slot.availableSeats <= 0 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200' 
                    : ''
                }
                relative
            `}
        >
            {/* Time: Primary text */}
            <span className="font-medium">
                {slot.startTime}
            </span>
            
            {/* Status: Secondary text, displayed next to the time */}
            <span 
                className={`text-xs p-1 rounded ${slot.availableSeats <= 0 
                    ? 'text-gray-500 bg-gray-200' // Disabled/Sold out style
                    // Active style: use the selected color if chosen, otherwise green
                    : selectedSlot?._id === slot._id
                        ? 'text-black' 
                        : 'text-green-700 bg-green-100'
                }`}
            >
                {slot.availableSeats > 0 ? `${slot.availableSeats} left` : 'Sold out'}
            </span>
        </button>
    ))}
</div>
              <p className="text-xs text-gray-500 mt-4">All times are in IST (GMT +5:30)</p>
            </div>

            {/* About Section */}
            <div className="pt-2">
              <h3 className="text-xl font-semibold mb-2">About</h3>
              <p className="text-gray-700 bg-[rgb(238,238,238)] p-3 rounded">Scenic routes, trained guides, and safety briefing. Minimum age 10.</p>
            </div>

          </div>
          
          {/* RIGHT COLUMN: Order Summary (passing state and setters) */}
          <div className="lg:w-1/3 lg:sticky lg:top-4 h-fit">
            <OrderSummary 
              experience={experience} 
              selectedSlot={selectedSlot} 
              handleContinue={handleContinue}
              // Pass state and setters down
              quantity={quantity}
              setQuantity={setQuantity}
              subtotal={subtotal}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;