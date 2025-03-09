import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SelectedComponent from '../../components/SelectedComponent/SelectedComponent';
import './Tome.css';

const Tome = () => {
    const { tomelist, tomenumber } = useParams();
    const [tomeData, setTomeData] = useState(null);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTomeData = async () => {
            try {
                const url = `https://kpiece2.s3.eu-west-3.amazonaws.com/data/tomes/${tomelist}.json`;
                const response = await fetch(url);
                const data = await response.json();
                const tome = data.find(t => t.tome === parseInt(tomenumber));
                if (tome) {
                    setTomeData(tome);
                    fetchScans(tome);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Erreur lors du chargement du tome:", error);
                setLoading(false);
            }
        };

        const fetchScans = async (tome) => {
            let fetchedScans = [];
            const sagas = Array.isArray(tome.saga) ? tome.saga : [tome.saga];
            const arcs = Array.isArray(tome.arc) ? tome.arc : [tome.arc];

            for (let saga of sagas) {
                for (let arc of arcs) {
                    try {
                        const url = `https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga/${saga}/${arc}.json`;
                        const response = await fetch(url);
                        if (response.ok) {
                            const arcScans = await response.json();
                            const filteredScans = arcScans.filter(scan =>
                                scan.scan >= tome.firstscan && scan.scan <= tome.lastscan
                            );
                            fetchedScans = [...fetchedScans, ...filteredScans];
                        }
                    } catch (error) {
                        console.error(`Erreur lors du chargement des scans pour ${arc}:`, error);
                    }
                }
            }

            // Fetch arc color data and merge with each scan
            try {
                const colorsResponse = await fetch("https://kpiece2.s3.eu-west-3.amazonaws.com/data/arccolor.json");
                if (colorsResponse.ok) {
                    const arcColors = await colorsResponse.json();
                    const updatedScans = fetchedScans.map(scan => {
                        const arcColor = arcColors.find(item => item.arc.toLowerCase() === scan.arc.toLowerCase());
                        return arcColor
                            ? {
                                    ...scan,
                                    color1: '#' + arcColor.color[0],
                                    color2: '#' + arcColor.color[1],
                                    arcName: arcColor.arcName
                                }
                            : scan;
                    });
                    setScans(updatedScans);
                } else {
                    setScans(fetchedScans);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des couleurs d'arcs:", error);
                setScans(fetchedScans);
            }
            setLoading(false);
        };

        fetchTomeData();
    }, [tomelist, tomenumber]);

    if (loading) return <div>Chargement...</div>;
    if (!tomeData) return <div>Aucun tome trouvé.</div>;

    return (
        <div className="Tome-Page">
            <SelectedComponent 
                componentName={`Tome ${tomenumber}`}
                componentImgLink={`https://kpiece2.s3.eu-west-3.amazonaws.com/img/tomes/${tomelist}/${tomenumber}.webp`}
                scanCounter={tomeData.lastscan - tomeData.firstscan}
                scans={scans}
                componentLink={`/tomes/${tomelist}/${tomenumber}/01`}
            />
        </div>
    );
};

export default Tome;
