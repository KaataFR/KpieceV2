import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TomeCard.css';

const TomeCard = ({ tomeNumber, imgTome, fallbackSources = [], tomeName }) => {
    const navigate = useNavigate();
    const [currentSrc, setCurrentSrc] = useState(imgTome);
    const [fallbackIndex, setFallbackIndex] = useState(0);

    const handleError = () => {
        // Si une image échoue, on passe à la source suivante dans le tableau fallbackSources
        if (fallbackIndex < fallbackSources.length) {
            setCurrentSrc(fallbackSources[fallbackIndex]);
            setFallbackIndex(fallbackIndex + 1);
        } else {
            console.error('Aucune image disponible pour ce tome.');
        }
    };

    const handleClick = () => {
        const currentPath = window.location.pathname;
        navigate(`${currentPath}/${tomeNumber}`);
    };

    return (
        <div className="tome-card" onClick={handleClick}>
            <h3>TOME {tomeNumber}</h3>
            <img 
                src={currentSrc} 
                onError={handleError} 
                alt={`Illustration of ${tomeName}`} 
                className="tome-card-image" 
            />
            <h4>{tomeName}</h4>
        </div>
    );
};

export default TomeCard;
