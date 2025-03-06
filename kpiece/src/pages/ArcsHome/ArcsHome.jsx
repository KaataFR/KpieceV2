import React, { useEffect, useState } from 'react';
import ArcCard from '../../components/ArcCard/ArcCard';
import './ArcsHome.css';

const ArcsHome = () => {
    const [sagas, setSagas] = useState([]);

    useEffect(() => {
        const fetchSagas = async () => {
            try {
                const response = await fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSagas(data);
            } catch (error) {
                console.error('Error fetching saga data:', error);
            }
        };

        fetchSagas();
    }, []);

    const [ascending, setAscending] = useState(true);
    
    return (
        <div className="arc-page">
             <h2 className='arc-h2'> Liste des arcs </h2>
            <div className="sort-button">
                <button onClick={() => setAscending(!ascending)}>
                    <i className={`fa-solid fa-angles-up ${!ascending ? 'rotated' : ''}`}></i>
                </button>
            </div>
            {[...sagas]
                .sort((a, b) => ascending ? a.number - b.number : b.number - a.number)
                .map((saga, index) => (
                    <ArcCard
                        key={saga.id || index}
                        saga={saga.name}
                        arcssearch={saga.arcssearch}
                        arcs={
                            Array.isArray(saga.arcsname) && Array.isArray(saga.arcssearch)
                                ? saga.arcsname.map((arcName, idx) => ({
                                    arc: arcName,
                                    arcimg: `https://kpiece2.s3.eu-west-3.amazonaws.com/img/arcs/${saga.arcssearch[idx]}.webp`
                                }))
                                : []
                        }
                    />
                ))}
        </div>
    );
};

export default ArcsHome;
