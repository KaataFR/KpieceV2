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

    const handleVerticalScan = () => {
        setVerticalScan(prev => !prev);
    };

    // Handler for scan select change - navigate to the chosen scan's first page.
    const handleScanSelect = (e) => {
        const newScan = e.target.value;
        navigate(`/scan/${scansaga}/${scanarc}/${newScan}/1`);
    };

    // Add an extra page with 3 customizable divs
    const getCustomPageContent = () => {
        return (
            <div className="last-page">

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

    // Check if current page is the custom page (maxPage + 1)
    const isCustomPage = (page, maxPageNum) => {
        return page === maxPageNum + 1;
    };

    // Function to preload all images
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
                // Save all scans for the current arc for the select dropdown.
                setArcScans(data);
                const scanData = data.find(scan => scan.scan === parseInt(selectedscan));
                if (scanData) {
                    const maxPages = scanData.maxpages;
                    console.log('Max pages:', maxPages);
                    const pagesArray = Array.from({ length: maxPages }, (_, i) => i + 1);
                    setPages(pagesArray);
                    // Start preloading all images
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

    // Scroll to top when page changes
    useEffect(() => {
        if (!loading && !preloading) {
            window.scrollTo(0, 0);
        }
    }, [selectedpagescan, loading, preloading]);

    // Loading component with progress bar
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

    // Determine current page (if missing, default to 1)
    const currentPage = selectedpagescan && pages.includes(parseInt(selectedpagescan))
        ? parseInt(selectedpagescan)
        : 1;
    const maxPage = pages[pages.length - 1];
    // Check if current page is the custom page
    const showCustomPage = isCustomPage(parseInt(selectedpagescan), maxPage);
    // When currentPage is not in pages and not the custom page, show normal final view
    const isFinalView = !pages.includes(currentPage) && !showCustomPage;

    // Navigation function for updating the URL with a new page number
    const navigateToPage = (page) => {
        navigate(`/scan/${scansaga}/${scanarc}/${selectedscan}/${page}`);
    };

    // In horizontal mode we wrap the image in a container to detect left/right clicks.
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

    // Handlers for final view buttons
    const handlePrevScan = () => {
        const prevScan = parseInt(selectedscan) - 1;
        navigate(`/scan/${scansaga}/${scanarc}/${prevScan}/1`);
    };

    const handleNextScan = () => {
        const nextScan = parseInt(selectedscan) + 1;
        navigate(`/scan/${scansaga}/${scanarc}/${nextScan}/1`);
    };

    const handleReturnToReading = () => {
        navigateToPage(maxPage);
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
            {/* New elements above the scan bar */}

            <div className='top-scan-element'>
                <div className="page-counter">
                    Page {currentPage} / {maxPage}
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
