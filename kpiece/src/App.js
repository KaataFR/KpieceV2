import React, { useState, useEffect } from 'react';
import './App.css';
import Routes from './Routes/routes';
import Home from './pages/Accueil/Home';
import Loading from './components/Loading/Loading';


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="App">
      
      <Routes>
        <Home />
      </Routes>
    </div>
  );
}

export default App;
