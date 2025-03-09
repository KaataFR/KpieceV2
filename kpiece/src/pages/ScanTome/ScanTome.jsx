import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ScanTome.css';
import ScanBar from '../../components/ScanBar/ScanBar';
import Loading from '../../components/Loading/Loading';

const ScanTome = () => {
    const { tomelist, tomenumber, selectedpagetome } = useParams();
    const navigate = useNavigate();
    const [allPages, setAllPages] = useState([]);
    const [scansInfo, setScansInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [preloading, setPreloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [verticalScan, setVerticalScan] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentPageInput, setCurrentPageInput] = useState(selectedpagetome || 1);
    const [tomeData, setTomeData] = useState(null);


    // Audio pour la page "To Be Continued"
    const [audio] = useState(new Audio('https://kpiece2.s3.eu-west-3.amazonaws.com/ost/tobecontinued.mp3'));

    // Gestion du mode plein écran
    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    setIsFullScreen(true);
                    document.body.classList.add('fullscreen-mode');
                })
                .catch(err => console.error(`Erreur lors de l'activation du plein écran : ${err.message}`));
        } else if (document.exitFullscreen) {
            document.body.classList.remove('fullscreen-mode');
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // Gestion de la vue verticale
    const handleVerticalScan = () => setVerticalScan(prev => !prev);

    // Gestion de l'audio pour la page "To Be Continued"
    useEffect(() => {
        if (!loading && !preloading && allPages.length > 0) {
            const maxPage = allPages.length;
            const isLastPage = parseInt(selectedpagetome) === maxPage + 1;

            if (isLastPage) {
                audio.volume = 0.05; // Volume à 5%
                audio.currentTime = 0; // Réinitialisation
                audio.play().catch(err => console.error('Échec de la lecture audio :', err));
            }
        }
    }, [selectedpagetome, allPages, loading, preloading, audio]);

    // Contenu personnalisé pour la dernière page
    const getCustomPageContent = () => (
        <div className="last-page">
            <h2> TO BE CONTINUED... </h2>
            <div className="bouton-last-page next-tome">
                <button onClick={handleNextTome}>
                    <i className="fa-solid fa-arrow-right"></i> Tome suivant
                </button>
            </div>
            <div className="bouton-last-page back-page">
                <button onClick={handleReturnToReading}>
                    <i className="fa-solid fa-arrow-left"></i> RETOUR
                </button>
            </div>
            <div className="bouton-last-page back-tome">
                <button onClick={handlePrevTome}>
                    <i className="fa-solid fa-arrow-left"></i> Tome précédent
                </button>
            </div>
        </div>
    );

    const isCustomPage = (page, maxPageNum) => page === maxPageNum + 1;

    const preloadImages = async (pages) => {
        setPreloading(true);
        let loadedCount = 0;
        const totalImages = pages.length;
        const batchSize = 20;
    
        // Fonction utilitaire qui retourne une promesse résolue lors du chargement (ou erreur) d'une image
        const loadImage = (page) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = page.url;
                img.onload = () => {
                    loadedCount++;
                    setProgress(Math.floor((loadedCount / totalImages) * 100));
                    resolve();
                };
                img.onerror = () => {
                    loadedCount++;
                    setProgress(Math.floor((loadedCount / totalImages) * 100));
                    resolve();
                };
            });
        };
    
        // Traitement par lots de 20 images
        for (let i = 0; i < totalImages; i += batchSize) {
            const batch = pages.slice(i, i + batchSize);
            await Promise.all(batch.map(loadImage));
        }
    
        setPreloading(false);
    };
    

  useEffect(() => {
    const fetchTomeData = async () => {
        try {
            const response = await fetch(`https://kpiece2.s3.eu-west-3.amazonaws.com/data/tomes/${tomelist}.json`);
            if (!response.ok) throw new Error('Échec de la récupération des données du tome');
            const tomes = await response.json();
            // Trier les tomes par numéro en ordre croissant
            tomes.sort((a, b) => a.tome - b.tome);
            const currentTome = tomes.find(t => t.tome === parseInt(tomenumber));
            if (!currentTome) throw new Error('Tome non trouvé');
            const tomeIndex = tomes.findIndex(t => t.tome === parseInt(tomenumber));
            const prevTome = tomeIndex > 0 ? tomes[tomeIndex - 1].tome : null;
            const nextTome = tomeIndex < tomes.length - 1 ? tomes[tomeIndex + 1].tome : null;
            setTomeData({ ...currentTome, prevTome, nextTome });

            const searchResponse = await fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/search.json');
            if (!searchResponse.ok) throw new Error('Échec de la récupération des données de recherche');
            const searchData = await searchResponse.json();

            const arcs = Array.isArray(currentTome.arc) ? currentTome.arc : [currentTome.arc];
            let scans = [];
            for (const arc of arcs) {
                const arcData = searchData.find(s => s.arc === arc);
                if (!arcData) continue;
                const start = Math.max(currentTome.firstscan, arcData.firstscan);
                const end = Math.min(currentTome.lastscan, arcData.lastscan);
                for (let scan = start; scan <= end; scan++) {
                    scans.push({ saga: arcData.saga, arc, scan });
                }
            }

            if (scans.length === 0) throw new Error('Aucun scan trouvé pour ce tome');

            let allPagesData = [];
            let scanInfoArray = [];
            for (const scanInfo of scans) {
                const { saga, arc, scan } = scanInfo;
                const scanResponse = await fetch(`https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga/${saga}/${arc}.json`);
                if (!scanResponse.ok) {
                    console.error(`Échec de la récupération des données pour le scan ${scan}`);
                    continue;
                }

                const arcData = await scanResponse.json();
                const scanData = arcData.find(s => s.scan === parseInt(scan));
                if (!scanData) {
                    console.error(`Scan ${scan} non trouvé dans les données de l'arc`);
                    continue;
                }

                const maxPages = scanData.maxpages;
                const pageStartIndex = allPagesData.length + 1;

                scanInfoArray.push({
                    saga,
                    arc,
                    scan,
                    name: scanData.name,
                    startPage: pageStartIndex,
                    endPage: pageStartIndex + maxPages - 1,
                    maxpages: maxPages
                });

                for (let i = 1; i <= maxPages; i++) {
                    const formattedPage = i < 10 ? `0${i}` : i;
                    allPagesData.push({
                        pageNum: allPagesData.length + 1,
                        url: `https://kpiece2.s3.eu-west-3.amazonaws.com/scan/${saga}/${arc}/${scan}/${formattedPage}.png`,
                        scanIndex: scanInfoArray.length - 1
                    });
                }
            }

            setAllPages(allPagesData);
            setScansInfo(scanInfoArray);
            preloadImages(allPagesData);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            setError(error.message);
            setLoading(false);
        }
    };

    fetchTomeData();
}, [tomelist, tomenumber]);

    // Défilement après chargement
    useEffect(() => {
        if (!loading && !preloading) window.scrollTo(0, 170);
    }, [selectedpagetome, loading, preloading]);

    // Mise à jour de l'entrée de page
    useEffect(() => {
        setCurrentPageInput(selectedpagetome || 1);
    }, [selectedpagetome]);

    // Composant de chargement
    const LoadingComponent = () => {
        if (preloading) {
            return (
                <div className="loading-container">
                    <div className="spinner">
                        <div className="double-bounce1"></div>
                        <div className="double-bounce2"></div>
                    </div>
                    <p>Chargement des pages : {progress}%</p>
                    <div className="scan-loading-progress-bar">
                        <div className="scan-loading-progress" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            );
        }
        return <Loading />;
    };

    if (loading || preloading) return <LoadingComponent />;
    if (error) return <div className="scan-page-error">Tome Non disponible</div>;

    const maxPage = allPages.length;
    const currentPage = selectedpagetome && parseInt(selectedpagetome) <= maxPage + 1
        ? parseInt(selectedpagetome)
        : 1;
    const showCustomPage = isCustomPage(parseInt(selectedpagetome), maxPage);
    const isFinalView = currentPage > maxPage && !showCustomPage;

    // Informations sur le scan actuel
    const getCurrentScanInfo = () => {
        if (!currentPage || currentPage > maxPage) return null;
        return scansInfo[allPages[currentPage - 1]?.scanIndex];
    };

    const currentScanInfo = getCurrentScanInfo();

    // Navigation vers une page spécifique
    const navigateToPage = (page) => navigate(`/tomes/${tomelist}/${tomenumber}/${page}`);

    // Gestion des clics sur l'image
    const handleImageClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (clickX < width / 2) {
            if (currentPage === 1) return;
            navigateToPage(currentPage - 1);
        } else {
            if (currentPage === maxPage) {
                navigateToPage(maxPage + 1);
            } else {
                navigateToPage(currentPage + 1);
            }
        }
    };

    const handlePrevTome = () => {
        if (tomeData && tomeData.prevTome) navigate(`/tomes/${tomelist}/${tomeData.prevTome}/1`);
    };

    const handleNextTome = () => {
        if (tomeData && tomeData.nextTome) navigate(`/tomes/${tomelist}/${tomeData.nextTome}/1`);
    };

    const handleReturnToReading = () => navigateToPage(maxPage);

    const handlePageInputChange = (e) => {
        if (/^\d*$/.test(e.target.value)) setCurrentPageInput(e.target.value);
    };

    const handlePageInputBlur = () => {
        const page = parseInt(currentPageInput, 10);
        if (page >= 1 && page <= maxPage) navigateToPage(page);
        else setCurrentPageInput(currentPage);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handlePageInputBlur();
    };

    // Contenu affiché
    let content = null;
    if (verticalScan) {
        content = allPages.map((page) => (
            <img
                key={page.pageNum}
                src={page.url}
                alt={`Page ${page.pageNum}`}
                className="scan-page-image"
            />
        ));
    } else if (showCustomPage) {
        content = getCustomPageContent();
    } else if (isFinalView) {
        content = (
            <div className="final-view">
                <button onClick={handlePrevTome}>
                    <i className="fa-solid fa-arrow-left"></i> Tome précédent
                </button>
                <button onClick={handleNextTome}>
                    <i className="fa-solid fa-arrow-right"></i> Tome suivant
                </button>
                <button onClick={handleReturnToReading}>
                    <i className="fa-solid fa-arrow-left"></i> Revenir à la lecture
                </button>
            </div>
        );
    } else {
        const currentPageData = allPages[currentPage - 1];
        content = (
            <div className="image-container" onClick={handleImageClick}>
                <div className="left-half" />
                <div className="right-half" />
                <img
                    src={currentPageData.url}
                    alt={`Page ${currentPage}`}
                    className="scan-page-image"
                />
            </div>
        );
    }

    return (
        <div className="scan-tome">
            <div className='top-scan-element'>
                <div className="page-counter">
                    Page <input
                        type="text"
                        value={currentPageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyDown={handleKeyDown}
                        style={{ width: '50px', textAlign: 'center' }}
                    /> / {maxPage}
                </div>
                {currentScanInfo && (
                    <div className="select-scan">
                        {/* Replace the current scan info with a scan selector */}
                        <select
                            value={currentScanInfo?.scan || ''}
                            onChange={(e) => {
                                const selectedScan = scansInfo.find(scan => scan.scan.toString() === e.target.value);
                                if (selectedScan) {
                                    navigateToPage(selectedScan.startPage);
                                }
                            }}
                        >
                            <option value="" disabled> Tome {tomenumber} - {tomeData?.name || 'Chargement...'} </option>
                            {scansInfo.map((scan, index) => (
                                <option key={index} value={scan.scan}>
                                   Chapitre {scan.scan} - {scan.name}
                                </option>
                            ))}
                        </select>
                    </div>

                )}
            </div>
            {
                !showCustomPage && (
                    <ScanBar
                        onFullScreen={handleFullScreen}
                        onVerticalScan={handleVerticalScan}
                        isFullScreen={isFullScreen}
                    />
                )
            }
            {content}
            {
                maxPage && !showCustomPage && !verticalScan && (
                    <div className="page-progress-bar">
                        <div
                            className="page-progress"
                            style={{ width: `${(currentPage / maxPage) * 100}%` }}
                        ></div>
                    </div>
                )
            }
        </div >
    );
};

export default ScanTome;