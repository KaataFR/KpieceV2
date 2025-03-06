import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ScanCard.css';

const ScanCard = ({ scanNumber, scanName, scanImage, scanDate, isNew, scanSaga, scanArcs }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/scan/${scanSaga}/${scanArcs}/${scanNumber}/01`);
    };

    return (
        <div className="scan-card" onClick={handleClick}>
            <h3>{scanNumber}</h3>
            <img src={scanImage} alt={`Illustration of ${scanName}`} className="scan-card-image" />
            <div className="scan-card-content">
                <h4>{scanName}</h4>
                <p>{scanDate}</p>
                {isNew && <span className="new-badge">Nouveau</span>}
            </div>
        </div>
    );
};

export default ScanCard;
