import React, { useEffect, useState } from 'react';
import './Home.css';
import ScanCard from '../../components/ScanCard/ScanCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [latestScans, setLatestScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sagaName, setSagaName] = useState('');
    const [arcName, setArcName] = useState('');
    const navigate = useNavigate();

    const baseUrl = 'https://kpiece2.s3.eu-west-3.amazonaws.com/';

    useEffect(() => {
        fetch(`${baseUrl}data/saga.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.');
                }
                return response.json();
            })
            .then(sagaData => {
                if (!sagaData || sagaData.length === 0) {
                    throw new Error("Aucune donnée de saga disponible");
                }

                const firstSaga = sagaData[0];
                const currentSagaName = firstSaga.saganame;
                setSagaName(currentSagaName);

                if (!firstSaga.arcssearch || firstSaga.arcssearch.length === 0) {
                    throw new Error("Aucun arc trouvé dans les données de saga");
                }

                const latestArc = firstSaga.arcssearch[0];
                setArcName(latestArc);

                return fetch(`${baseUrl}data/saga/${currentSagaName}/${latestArc}.json`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                        }
                        return response.json();
                    });
            })
            .then(data => {
                const sortedScans = [...data].sort((a, b) => b.scan - a.scan);
                const latest = sortedScans.slice(0, 4);
                console.log("Latest scans:", latest);
                setLatestScans(latest);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">Erreur: {error}</div>;

    const handlePlusClick = () => {
        navigate(`/saga/${sagaName}/${arcName}`);
    };

    return (
        <div className="home-page">
            <h2>Derniers chapitres</h2>
            <div className="cards-container">
                {latestScans.length > 0 ? (
                    latestScans.map((scan, index) => (
                        <ScanCard
                            key={scan.scan}
                            scanNumber={scan.scan}
                            scanName={scan.name}
                            scanDate={scan.date}
                            isNew={index === 0}
                            scanImage={`${baseUrl}scan/${sagaName}/${arcName}/${scan.scan}/01.png`}
                            scanSaga={sagaName}
                            scanArcs={arcName}
                        />
                    ))
                ) : (
                    <p>Aucun chapitre disponible</p>
                )}
                
            </div>
            <div className="plus-button-container">
                    <button className="plus-button" onClick={handlePlusClick}>+</button>
                </div>
        </div>
    );
};

export default Home;