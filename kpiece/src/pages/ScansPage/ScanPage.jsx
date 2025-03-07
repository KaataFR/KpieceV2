import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ScanPage.css';
import ScanBar from '../../components/ScanBar/ScanBar';
import Loading from '../../components/Loading/Loading';

const ScanPage = () => {
    const { scansaga, scanarc, selectedscan, selectedpagescan } = useParams();
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [arcScans, setArcScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [preloading, setPreloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [verticalScan, setVerticalScan] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentPageInput, setCurrentPageInput] = useState(selectedpagescan || 1);

    // Nouveau: stockage des données search.json
    const [searchData, setSearchData] = useState([]);

    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    setIsFullScreen(true);
                    document.body.classList.add('fullscreen-mode');
                })
                .catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
        } else if (document.exitFullscreen) {
            document.body.classList.remove('fullscreen-mode');
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // Audio for "To Be Continued" page
    const [audio] = useState(new Audio('https://kpiece2.s3.eu-west-3.amazonaws.com/ost/tobecontinued.mp3'));

    useEffect(() => {
        // Chargement de search.json
        const fetchSearchData = async () => {
            try {
                const response = await fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/search.json');
                if (!response.ok) {
                    throw new Error('Impossible de récupérer search.json');
                }
                const data = await response.json();
                setSearchData(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSearchData();
    }, []);

    useEffect(() => {
        // Only play audio when the custom "To Be Continued" page is shown
        if (!loading && !preloading && pages.length > 0) {
            const maxPage = pages[pages.length - 1];
            const isLastPage = parseInt(selectedpagescan) === maxPage + 1;

            if (isLastPage) {
                audio.volume = 0.05; // Set volume to 5%
                audio.currentTime = 0; // Reset audio to beginning
                audio.play().catch(err => console.error('Audio playback failed:', err));
            }
        }
    }, [selectedpagescan, pages, loading, preloading, audio]);

    const handleVerticalScan = () => {
        setVerticalScan(prev => !prev);
    };

    // Handler for scan select change - navigate to the chosen scan's first page
    const handleScanSelect = (e) => {
        const newScan = e.target.value;
        navigate(`/scan/${scansaga}/${scanarc}/${newScan}/1`);
    };

    // Custom Page
    const getCustomPageContent = () => {
        return (
            <div className="last-page">
                <h2> TO BE CONTINUED... </h2>
                <div className="bouton-last-page next-scan">
                    <button onClick={handleNextScan}>
                        <i className="fa-solid fa-arrow-right"></i> Scan suivant
                    </button>
                </div>
                <div className="bouton-last-page back-page">
                    <button onClick={handleReturnToReading}>
                        <i className="fa-solid fa-arrow-left"></i> RETOUR
                    </button>
                </div>
                <div className="bouton-last-page back-scan">
                    <button onClick={handlePrevScan}>
                        <i className="fa-solid fa-arrow-left"></i> Scan précédent
                    </button>
                </div>
            </div>
        );
    };

    const isCustomPage = (page, maxPageNum) => {
        return page === maxPageNum + 1;
    };

    const preloadImages = (pagesArray) => {
        setPreloading(true);
        let loadedCount = 0;
        pagesArray.forEach((page) => {
            const formattedPage = page < 10 ? `0${page}` : page;
            const img = new Image();
            img.src = `https://kpiece2.s3.eu-west-3.amazonaws.com/scan/${scansaga}/${scanarc}/${selectedscan}/${formattedPage}.png`;
            img.onload = () => {
                loadedCount++;
                const newProgress = Math.floor((loadedCount / pagesArray.length) * 100);
                setProgress(newProgress);
                if (loadedCount === pagesArray.length) {
                    setPreloading(false);
                }
            };
            img.onerror = () => {
                loadedCount++;
                const newProgress = Math.floor((loadedCount / pagesArray.length) * 100);
                setProgress(newProgress);
                if (loadedCount === pagesArray.length) {
                    setPreloading(false);
                }
            };
        });
    };

    useEffect(() => {
        const fetchScanData = async () => {
            try {
                const response = await fetch(`https://kpiece2.s3.eu-west-3.amazonaws.com/data/saga/${scansaga}/${scanarc}.json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch scan data');
                }
                const data = await response.json();
                setArcScans(data);
                const scanData = data.find(scan => scan.scan === parseInt(selectedscan));
                if (scanData) {
                    const maxPages = scanData.maxpages;
                    const pagesArray = Array.from({ length: maxPages }, (_, i) => i + 1);
                    setPages(pagesArray);
                    preloadImages(pagesArray);
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

    useEffect(() => {
        if (!loading && !preloading) {
            window.scrollTo(0, 170);
        }
    }, [selectedpagescan, loading, preloading]);

    useEffect(() => {
        setCurrentPageInput(selectedpagescan || 1);
    }, [selectedpagescan]);

    const LoadingComponent = () => {
        if (preloading) {
            return (
                <div className="loading-container">
                    <div className="spinner">
                        <div className="double-bounce1"></div>
                        <div className="double-bounce2"></div>
                    </div>
                    <p>Chargement des pages: {progress}%</p>
                    <div className="scan-loading-progress-bar">
                        <div className="scan-loading-progress" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            );
        }
        return <Loading />;
    };

    if (loading || preloading) return <LoadingComponent />;
    if (error) return <div className="scan-page-error">Scan Non disponible</div>;

    const currentPage = selectedpagescan && pages.includes(parseInt(selectedpagescan))
        ? parseInt(selectedpagescan)
        : 1;
    const maxPage = pages[pages.length - 1];
    const showCustomPage = isCustomPage(parseInt(selectedpagescan), maxPage);
    const isFinalView = !pages.includes(currentPage) && !showCustomPage;

    const navigateToPage = (page) => {
        navigate(`/scan/${scansaga}/${scanarc}/${selectedscan}/${page}`);
    };

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

    // Modification: utiliser searchData pour saga/arc quand on change de scan
    const handlePrevScan = () => {
        const prevScan = parseInt(selectedscan) - 1;
        const foundPrev = searchData.find(item => prevScan >= item.firstscan && prevScan <= item.lastscan);
        if (foundPrev) {
            navigate(`/scan/${foundPrev.saga}/${foundPrev.arc}/${prevScan}/1`);
        } else {
            console.log('Scan précédent introuvable dans searchData');
        }
    };

    const handleNextScan = () => {
        const nextScan = parseInt(selectedscan) + 1;
        const foundNext = searchData.find(item => nextScan >= item.firstscan && nextScan <= item.lastscan);
        if (foundNext) {
            navigate(`/scan/${foundNext.saga}/${foundNext.arc}/${nextScan}/1`);
        } else {
            console.log('Scan suivant introuvable dans searchData');
        }
    };

    const handleReturnToReading = () => {
        navigateToPage(maxPage);
    };

    const handlePageInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setCurrentPageInput(value);
        }
    };

    const handlePageInputBlur = () => {
        const page = parseInt(currentPageInput, 10);
        if (page >= 1 && page <= maxPage) {
            navigateToPage(page);
        } else {
            setCurrentPageInput(currentPage);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handlePageInputBlur();
        }
    };

    let content = null;

    if (verticalScan) {
        content = pages.map(page => {
            const formattedPage = page < 10 ? `0${page}` : page;
            return (
                <img
                    key={page}
                    src={`https://kpiece2.s3.eu-west-3.amazonaws.com/scan/${scansaga}/${scanarc}/${selectedscan}/${formattedPage}.png`}
                    alt={`Page ${formattedPage}`}
                    className="scan-page-image"
                />
            );
        });
    } else {
        if (showCustomPage) {
            content = getCustomPageContent();
        } else if (isFinalView) {
            content = (
                <div className="final-view">
                    <button onClick={handlePrevScan}>
                        <i className="fa-solid fa-arrow-left"></i> Scan précédent
                    </button>
                    <button onClick={handleNextScan}>
                        <i className="fa-solid fa-arrow-right"></i> Scan suivant
                    </button>
                    <button onClick={handleReturnToReading}>
                        <i className="fa-solid fa-arrow-left"></i> Revenir à la lecture
                    </button>
                </div>
            );
        } else {
            const formattedPage = currentPage < 10 ? `0${currentPage}` : currentPage;
            content = (
                <div className="image-container" onClick={handleImageClick}>
                    <div className="left-half" />
                    <div className="right-half" />
                    <img
                        src={`https://kpiece2.s3.eu-west-3.amazonaws.com/scan/${scansaga}/${scanarc}/${selectedscan}/${formattedPage}.png`}
                        alt={`Page ${formattedPage}`}
                        className="scan-page-image"
                    />
                </div>
            );
        }
    }

    return (
        <div className="scan-page">
            <div className='top-scan-element'>
                <div className="page-counter">
                    Page <input
                        type="text"
                        value={currentPageInput}
                        onChange={handlePageInputChange}
                        onBlur={handlePageInputBlur}
                        onKeyPress={handleKeyPress}
                        style={{ width: '50px', textAlign: 'center' }}
                    /> / {maxPage}
                </div>
                <div className="select-scan">
                    <select value={selectedscan} onChange={handleScanSelect}>
                        {arcScans.map((scan) => (
                            <option key={scan.scan} value={scan.scan}>
                                {scan.scan} - {scan.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {!showCustomPage && (
                <ScanBar
                    onFullScreen={handleFullScreen}
                    onVerticalScan={handleVerticalScan}
                    isFullScreen={isFullScreen}
                />
            )}
            {content}
            {maxPage && !showCustomPage && !verticalScan && (
                <div className="page-progress-bar">
                    <div
                        className="page-progress"
                        style={{ width: `${(currentPage / maxPage) * 100}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default ScanPage;