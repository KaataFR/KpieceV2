import React, { useState, useRef, useEffect } from 'react';
import './Ost.css';

const Ost = () => {
    const [isOn, setIsOn] = useState(false);
    const [volume, setVolume] = useState(50);
    const [currentMood, setCurrentMood] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tracks, setTracks] = useState({
        happy: [],
        sad: [],
        chill: [],
        mysterious: [],
        fight: [],
        epic: []
    });
    const [ostInfo, setOstInfo] = useState([]);
    const audioRef = useRef(null);
    const baseUrl = "https://kpiece2.s3.eu-west-3.amazonaws.com/ost/";

    // Charge les informations des OST depuis le JSON
    const fetchOstInfo = async () => {
        try {
            const response = await fetch("https://kpiece2.s3.eu-west-3.amazonaws.com/ost/ost.json");
            if (!response.ok) {
                throw new Error("Failed to fetch OST info");
            }
            const data = await response.json();
            setOstInfo(data);
            return data;
        } catch (error) {
            console.error("Error fetching OST info:", error);
            return [];
        }
    };

    // Charge les pistes disponibles pour un mood donné
    const loadTracksForMood = async (mood, info = null) => {
        setIsLoading(true);
        const moodTracks = [];
        
        // Utilise les infos déjà chargées ou charge-les si nécessaire
        const ostData = info || ostInfo || await fetchOstInfo();
        
        // Trouve le nombre de pistes pour ce mood
        const moodInfo = ostData.find(item => item.name === mood);
        
        if (moodInfo) {
            // Génère la liste des pistes selon le format {mood}1.mp3 à {mood}{ostnumber}.mp3
            for (let i = 1; i <= moodInfo.ostnumber; i++) {
                moodTracks.push(`${mood}${i}.mp3`);
            }
        }

        setTracks(prev => ({
            ...prev,
            [mood]: moodTracks
        }));

        setIsLoading(false);
        return moodTracks;
    };

    // Joue une piste déterminée (index) pour un mood donné
    const playTrack = async (mood, index) => {
        // Active le lecteur s'il était éteint
        if (!isOn) {
            setIsOn(true);
        }
        setIsLoading(true);
        let moodTracks = tracks[mood];

        if (!moodTracks || moodTracks.length === 0) {
            moodTracks = await loadTracksForMood(mood);
        }
        if (moodTracks && moodTracks.length > 0) {
            // Gestion du débordement d'index (pagination circulaire)
            if (index >= moodTracks.length) {
                index = 0;
            } else if (index < 0) {
                index = moodTracks.length - 1;
            }
            const track = moodTracks[index];
            const trackUrl = `${baseUrl}${mood}/${track}`;

            if (audioRef.current) {
                if (audioRef.current.src) {
                    audioRef.current.pause();
                }
                audioRef.current.src = trackUrl;
                audioRef.current.volume = volume / 100;
                audioRef.current.oncanplaythrough = () => {
                    audioRef.current.play()
                        .then(() => {
                            setCurrentMood(mood);
                            setCurrentIndex(index);
                            setIsPlaying(true);
                            setIsLoading(false);
                        })
                        .catch(error => {
                            console.error("Erreur lors de la lecture:", error);
                            setIsPlaying(false);
                            setIsLoading(false);
                        });
                };
                audioRef.current.onerror = () => {
                    console.error(`Erreur de chargement pour: ${trackUrl}`);
                    setIsPlaying(false);
                    setIsLoading(false);
                };
            }
        } else {
            console.error(`Aucune piste trouvée pour l'ambiance: ${mood}`);
            setIsPlaying(false);
            setIsLoading(false);
        }
    };

    // Sélectionne un mood si différent (sans recharger si déjà sélectionné)
    const handleMoodClick = (mood) => {
        if (currentMood !== mood) {
            // Commence par la première piste du mood sélectionné
            playTrack(mood, 0);
        }
    };

    // Bouton suivant : passe à la piste suivante du mood en cours
    const handleNext = () => {
        if (currentMood) {
            playTrack(currentMood, currentIndex + 1);
        }
    };

    // Bouton précédent : revient à la piste précédente du mood en cours
    const handlePrev = () => {
        if (currentMood) {
            playTrack(currentMood, currentIndex - 1);
        }
    };

    // Gestion du volume
    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    // Gère la pause et la reprise de l'audio
    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else if (audioRef.current.src) {
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(error => {
                        console.error("Erreur lors de la reprise de lecture:", error);
                    });
            } else if (currentMood) {
                playTrack(currentMood, currentIndex);
            }
        }
    };

    useEffect(() => {
        if (!isOn && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isOn]);

    // Charge les infos du JSON et initialise les pistes au démarrage
    useEffect(() => {
        if (isOn) {
            const initializeOst = async () => {
                setIsLoading(true);
                const info = await fetchOstInfo();
                
                // Initialise toutes les pistes pour chaque mood
                for (const moodInfo of info) {
                    await loadTracksForMood(moodInfo.name, info);
                }
                setIsLoading(false);
            };
            
            initializeOst();
        } else if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isOn]);

    return (
        <div className="ost-player">
            <div className="ost-title">OST</div>

            <div className="switch-container">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => setIsOn(!isOn)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>

            {isOn && (
                <>
                    <button
                        className="play-pause-button"
                        onClick={handlePlayPause}
                        disabled={isLoading || (!currentMood && !audioRef.current?.src)}
                    >
                        {isLoading ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : isPlaying ? (
                            <i className="fa-solid fa-pause"></i>
                        ) : (
                            <i className="fa-solid fa-play"></i>
                        )}
                    </button>
                    <div className="volume-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>

                    <div className="track-navigation">
                        <button className="prev-button" onClick={handlePrev} disabled={!currentMood || isLoading}>
                            <i className="fa-solid fa-backward"></i>
                        </button>
                        <button className="next-button" onClick={handleNext} disabled={!currentMood || isLoading}>
                            <i className="fa-solid fa-forward"></i>
                        </button>
                    </div>

                    <div className="mood-buttons">
                        {Object.keys(tracks).map(mood => (
                            <button
                                key={mood}
                                className={`mood-button ${currentMood === mood ? 'active' : ''} ${isLoading && currentMood !== mood ? 'disabled' : ''}`}
                                onClick={() => handleMoodClick(mood)}
                                disabled={isLoading && currentMood !== mood}
                            >
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="current-audio">
                        {audioRef.current?.src
                            ? `Ost: ${audioRef.current.src.split('/').pop()}`
                            : 'Aucune Ost chargé'}
                    </div>

                    <audio ref={audioRef} />
                </>
            )}
        </div>
    );
};

export default Ost;