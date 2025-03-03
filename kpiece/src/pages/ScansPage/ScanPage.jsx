import { useParams } from 'react-router-dom';
import './ScanPage.css';
import React, { useEffect, useState } from 'react';

const ScanPage = () => {
    const { scansaga, scanarc, selectedscan, selectedpagescan } = useParams();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScanData = async () => {
            try {
                const response = await fetch(`https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga/${scansaga}/${scanarc}.json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch scan data');
                }
                const data = await response.json();
                const scanData = data.find(scan => scan.scan === parseInt(selectedscan));
                if (scanData) {
                    const maxPages = scanData.maxpages;
                    console.log('Max pages:', maxPages); // Vérification de maxpages
                    const pagesArray = Array.from({ length: maxPages }, (_, i) => i + 1);
                    setPages(pagesArray);
                } else {
                    throw new Error('Scan not found');
                }
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchScanData();
    }, [scansaga, scanarc, selectedscan]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='scan-page'>
            {pages.map(page => {
                const formattedPage = page < 10 ? `0${page}` : page;
                return (
                    <img
                        key={page}
                        src={`https://kpiece2.s3.eu-west-3.amazonaws.com/scan/${scansaga}/${scanarc}/${selectedscan}/${formattedPage}.png`}
                        alt={`Page ${formattedPage}`}
                        className='scan-page-image'
                    />
                );
            })}
        </div>
    );
};

export default ScanPage;
