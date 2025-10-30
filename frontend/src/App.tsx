import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExperienceDetails from './pages/ExperienceDetails';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/experience/:id" element={<ExperienceDetails />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/confirmation" element={<Confirmation />} />
    </Routes>
  );
};

export default App;
