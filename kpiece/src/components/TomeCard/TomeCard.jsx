import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TomeCard.css';

const TomeCard = ({ tomeNumber, imgTome, tomeName }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const currentPath = window.location.pathname;
        navigate(`${currentPath}/${tomeNumber}`);
    };

    return (
        <div className="tome-card" onClick={handleClick}>
            <h3>TOME {tomeNumber}</h3>
            <img src={imgTome} alt={`Illustration of ${tomeName}`} className="tome-card-image" />
            <h4>{tomeName}</h4>
        </div>
    );
};

export default TomeCard;