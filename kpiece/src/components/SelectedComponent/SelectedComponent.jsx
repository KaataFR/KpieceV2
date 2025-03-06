import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SelectedComponent.css';

const SelectedComponent = ({
    componentName,
    componentImgLink,
    scanCounter,
    scans // on reçoit l'ensemble des scans en prop
}) => {
    const navigate = useNavigate();
    const [ascending, setAscending] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Tri des scans selon le numéro (par défaut tri croissant)
    const sortedScans = [...scans].sort((a, b) =>
        ascending ? parseInt(a.scan) - parseInt(b.scan) : parseInt(b.scan) - parseInt(a.scan)
    );

    // Pagination : 10 scans par page
    const itemsPerPage = 10;
    const totalPages = Math.ceil(sortedScans.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentScans = sortedScans.slice(startIndex, startIndex + itemsPerPage);

    const handleSortClick = () => setAscending(!ascending);
    const handleClick = () => navigate(-1);

    const ReadScan = (scan) => {
        navigate(`/scan/${scan.saga}/${scan.arc}/${scan.scan}/01`);
    };

    return (
        <div className="Selected-Component">
            <div className="Selected-Component-Header">
                <div className="back-button" onClick={handleClick}>
                    <i className="fa-solid fa-arrow-left"></i>
                </div>
                <div className="Selected-Component-card">
                    <img
                        src={componentImgLink}
                        alt={componentName}
                        className="Selected-Component-image"
                    />
                    <h2 className="Selected-Component-h2">{componentName}</h2>
                </div>
                <div className="Selected-Component-Counter">{scanCounter} Chapitres </div>
            </div>

            <div className="sort-button">
                <button onClick={handleSortClick}>
                    <i className={`fa-solid fa-angles-up ${!ascending ? 'rotated' : ''}`}></i>
                </button>
            </div>

            <div className="Selected-Component-List-Scan">
                {currentScans.map((scan, index) => (
                    <div className="Selected-Component-Scan" key={index}>
                        <h3> Chapitre {scan.scan}</h3>
                        <p
                            className="Selected-Component-Scan-Name"
                        >
                            {scan.name}
                        </p>
                        <p style={{
                            backgroundImage: `linear-gradient(45deg, ${scan.color1}, ${scan.color2})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }} className='Selected-Component-Scan-Arc'>{scan.arcName}</p>
                        <p className='Selected-Component-Scan-Date'>- {scan.date}</p>
                        <button
                            onClick={() => ReadScan(scan)}
                            className="read-scan-button"
                        >
                            Lire
                        </button>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={currentPage === index + 1 ? "active-page" : ""}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectedComponent;
