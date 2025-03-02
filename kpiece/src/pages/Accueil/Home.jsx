import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
    const [latestScans, setLatestScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // URL de base de votre bucket S3 (version HTTP publique)
    const baseUrl = 'https://kpiece2.s3.eu-west-3.amazonaws.com/';

    useEffect(() => {
        // Charger saga.json
        fetch(`${baseUrl}data/saga.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(sagaData => {
                if (sagaData && sagaData.length > 0) {
                    const firstSaga = sagaData[0];
                    const sagaName = firstSaga.saganame;

                    if (firstSaga.arcssearch && firstSaga.arcssearch.length > 0) {
                        const latestArc = firstSaga.arcssearch[0];

                        // Charger le fichier d'arc avec le chemin corrigé
                        return fetch(`${baseUrl}data/saga/${sagaName}/${latestArc}.json`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
                                }
                                return response.json();
                            });
                    } else {
                        throw new Error("Aucun arc trouvé dans les données de saga");
                    }
                } else {
                    throw new Error("Aucune donnée de saga disponible");
                }
            })
            .then(data => {
                const sortedScans = [...data].sort((a, b) => b.scan - a.scan);
                const latest = sortedScans.slice(0, 3);
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

    return (
        <div className="home-page">
            <h2>Derniers chapitres</h2>
            <div className="cards-container">
                {latestScans.length > 0 ? (
                    latestScans.map((scan) => (
                        <div key={scan.scan} className="home-page-card">
                            <h3> {scan.scan} </h3>
                            <div className='home-page-card-text'>
                                <h4> {scan.name} </h4>
                                <p>{scan.date}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Aucun chapitre disponible</p>
                )}
            </div>
        </div>
    );
};

export default Home;