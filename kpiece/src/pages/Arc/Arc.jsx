import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SelectedComponent from '../../components/SelectedComponent/SelectedComponent';
import './Arc.css';

const Arc = () => {
    const { saga, selectedarc } = useParams();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const response = await fetch(
                    `https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga/${saga}/${selectedarc}.json`
                );
                if (!response.ok) {
                    throw new Error('Erreur lors du fetch des scans');
                }
                const data = await response.json();
                setScans(data.map(scan => ({
                    scan: scan.scan,
                    name: scan.name,
                    arc: scan.arc,
                    tome: scan.tome,
                    maxpages: scan.maxpages,
                    date: scan.date,
                    saga: scan.saga,
                })));
            } catch (error) {
                console.error('Erreur lors du fetch:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, [saga, selectedarc]);

    useEffect(() => {
        fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga.json')
            .then(res => res.json())
            .then(json => {
                const match = json.find(item => item.saganame === saga);
                if (match && match.arcssearch && match.arcsname) {
                    const idx = match.arcssearch.indexOf(selectedarc);
                    if (idx >= 0) {
                        setScans(prev =>
                            prev.map(scan => ({
                                ...scan,
                                arcName: match.arcsname[idx],
                            }))
                        );
                    }
                }
            })
            .catch(console.error);
    }, [saga, selectedarc]);

    const componentName = scans[0]?.arcName || selectedarc;
    const componentImgLink = `https://kpiece2.s3.eu-west-3.amazonaws.com/img/arcs/${selectedarc}.webp`;
    const scanCounter = scans.length;

    return (
        <SelectedComponent
            componentName={componentName}
            componentImgLink={componentImgLink}
            scanCounter={scanCounter}
            scans={scans}
            loading={loading}
        />
    );
};

export default Arc;
