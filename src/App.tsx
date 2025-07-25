import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from  './components/Hero';
import './App.css';
import './index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Features from './components/Features';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <Header />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <Features />
            </main>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;