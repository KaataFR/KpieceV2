import './TomeHome.css';
import { Link, useParams } from 'react-router-dom';
import TomeCard from '../../components/TomeCard/TomeCard';
import React, { useEffect, useState } from 'react';

const TomeHome = () => {
    const [tomes, setTomes] = useState([]);
    const [ascending, setAscending] = useState(true); // État pour l'ordre de tri
    const { tomelist } = useParams();

    useEffect(() => {
        // Scroll to top when tomelist changes
        window.scrollTo(0, 0);
        
        fetch(`https://kpiece2.s3.eu-west-3.amazonaws.com/data/tomes/${tomelist}.json`)
            .then(response => response.json())
            .then(data => setTomes(data))
            .catch(error => console.error('Erreur lors de la récupération des tomes :', error));
    }, [tomelist]);
    

    const tomeRanges = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110'];

    // Fonction pour essayer différents formats d'image
    const getImageWithFallback = (baseUrl, tomeNumber) => {
        const formats = ['webp', 'jpg', 'png'];
        return formats.map(format => `${baseUrl}/${tomeNumber}.${format}`);
    };

    // Fonction pour trier les tomes
    const sortTomes = () => {
        return [...tomes].sort((a, b) => ascending ? a.tome - b.tome : b.tome - a.tome);
    };

    return (
        <>

            <h2 className='tome-h2'> Liste des tomes </h2>

            <div className="sort-button">
                <button onClick={() => setAscending(!ascending)}>
                    <i className={`fa-solid fa-angles-up ${!ascending ? 'rotated' : ''}`}></i>
                </button>
            </div>

           



            <div className="tome-selector">



                {tomeRanges.map(range => (
                    <Link
                        key={range}
                        to={`/tomes/${range}`}
                        className={tomelist === range ? "active" : ""}
                    >
                        TOME {range}+
                    </Link>
                ))}
            </div>

            <div className="tome-home">
                {sortTomes().map(tome => (
                    <TomeCard
                        key={tome.tome}
                        tomeNumber={tome.tome}
                        imgTome={`https://kpiece2.s3.eu-west-3.amazonaws.com/img/tomes/${tomelist}/${tome.tome}.webp`}
                        fallbackImages={getImageWithFallback(`https://kpiece2.s3.eu-west-3.amazonaws.com/img/tomes/${tomelist}/Image`, tome.tome)}
                        tomeName={tome.name}
                    />
                ))}
            </div>
        </>
    );
};

export default TomeHome;
