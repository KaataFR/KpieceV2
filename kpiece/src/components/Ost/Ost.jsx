import React, { useState, useRef, useEffect } from 'react';
import './Ost.css';

const Ost = () => {
    // On supprime "happy" et on ne garde que les moods désirés
    const [tracks, setTracks] = useState({
        chill: [],
        danger: [],
        emotion: [],
        epic: [],
        fight: [],
        fun: [],
        mysterious: [],
        sad: []
    });

    const [isOn, setIsOn] = useState(() => {
        const savedIsOn = localStorage.getItem('ostIsOn');
        return savedIsOn !== null ? JSON.parse(savedIsOn) : false;
    });

    const [volume, setVolume] = useState(() => {
        const savedVolume = localStorage.getItem('ostVolume');
        return savedVolume !== null ? JSON.parse(savedVolume) : 50;
    });
    const [currentMood, setCurrentMood] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [ostInfo, setOstInfo] = useState([]);
    const audioRef = useRef(null);
    const baseUrl = "https://kpiece2.s3.eu-west-3.amazonaws.com/ost/";

    // Récupération du JSON ost.json
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

    // Fonction pour jouer une piste aléatoire du mood actuel
    const handleRandomTrack = () => {
        if (currentMood && tracks[currentMood] && tracks[currentMood].length > 0) {
            // Génère un index aléatoire différent de l'index actuel
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * tracks[currentMood].length);
            } while (randomIndex === currentIndex && tracks[currentMood].length > 1);

            // Joue la piste aléatoire
            playTrack(currentMood, randomIndex);
        }
    };

    // Charge chaque piste sous forme d'objet { fileName, displayName }
    const loadTracksForMood = async (mood, info = null) => {
        setIsLoading(true);

        // On utilise les infos déjà chargées sinon on les fetch
        const data = info || ostInfo || await fetchOstInfo();

        // Trouve l'objet décrivant le mood dans ost.json
        const moodInfo = data.find(item => item.name === mood);
        if (!moodInfo) {
            console.error(`Aucune info trouvée pour le mood: ${mood}`);
            setIsLoading(false);
            return [];
        }

        // moodInfo.ostnumber = nombre de pistes
        // moodInfo.ostname = tableau de titres (ex. ["Mother Sea", "Gold and Oden", …])
        const moodTracks = moodInfo.ostname.map((title, idx) => ({
            fileName: `${idx + 1}.mp3`,  // ex: "1.mp3", "2.mp3"…
            displayName: title          // ex: "Mother Sea", …
        }));

        setTracks(prev => ({
            ...prev,
            [mood]: moodTracks
        }));
        setIsLoading(false);
        return moodTracks;
    };

    // Joue la piste (index) du mood
    const playTrack = async (mood, index) => {
        // Allume l'OST si elle est éteinte
        if (!isOn) {
            setIsOn(true);
        }
        setIsLoading(true);

        // Récupération des pistes pour le mood
        let moodTracks = tracks[mood];
        if (!moodTracks || moodTracks.length === 0) {
            moodTracks = await loadTracksForMood(mood);
        }

        if (moodTracks && moodTracks.length > 0) {
            // Gestion du débordement (index trop petit ou trop grand)
            if (index >= moodTracks.length) {
                index = 0;
            } else if (index < 0) {
                index = moodTracks.length - 1;
            }

            const trackObj = moodTracks[index];
            const trackUrl = `${baseUrl}${mood}/${trackObj.fileName}`;

            if (audioRef.current) {
                audioRef.current.pause();
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

    // Sélectionne un mood différent
    const handleMoodClick = (mood) => {
        if (currentMood !== mood) {
            playTrack(mood, 0);
        }
    };

    const handleNext = () => {
        if (currentMood) {
            playTrack(currentMood, currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentMood) {
            playTrack(currentMood, currentIndex - 1);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        localStorage.setItem('ostVolume', JSON.stringify(newVolume));
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

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

    // Éteint l'OST quand isOn passe à false
    useEffect(() => {
        if (!isOn && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isOn]);

    // Au montage ou quand isOn change :
    // charge l'ost.json et initialise les pistes
    useEffect(() => {
        if (isOn) {
            const initializeOst = async () => {
                setIsLoading(true);
                const info = await fetchOstInfo();
                // On précharge les pistes pour tous les moods
                for (const moodItem of info) {
                    await loadTracksForMood(moodItem.name, info);
                }
                setIsLoading(false);
            };
            initializeOst();
        } else if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isOn]);

    // Auto-play de la piste suivante quand la piste se termine
    useEffect(() => {
        if (audioRef.current) {
            const handleTrackEnded = () => {
                if (currentMood) {
                    playTrack(currentMood, currentIndex + 1);
                }
            };
            audioRef.current.addEventListener('ended', handleTrackEnded);
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener('ended', handleTrackEnded);
                }
            };
        }
    }, [currentMood, currentIndex]);

    // Enregistre l'état On/Off dans localStorage
    useEffect(() => {
        localStorage.setItem('ostIsOn', JSON.stringify(isOn));
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




                    <div className="track-navigation">
                        <button
                            className="prev-button"
                            onClick={handlePrev}
                            disabled={!currentMood || isLoading}
                        >
                            <i className="fa-solid fa-backward-step"></i>
                        </button>


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



                        <button
                            className="next-button"
                            onClick={handleNext}
                            disabled={!currentMood || isLoading}
                        >
                            <i className="fa-solid fa-forward-step"></i>
                        </button>

                        <button className='random-button'
                            onClick={handleRandomTrack} 
                            disabled={!currentMood || isLoading}
                    >
                        <i className="fa-solid fa-shuffle"></i>
                        
                    </button>
                    </div>



                    <div className="volume-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                        {volume}%
                    </div>

                    <div className="mood-buttons">
                        {Object.keys(tracks).map(mood => (
                            <button
                                key={mood}
                                className={
                                    `mood-button ${currentMood === mood ? 'active' : ''
                                    } ${isLoading && currentMood !== mood
                                        ? 'disabled'
                                        : ''
                                    }`
                                }
                                onClick={() => handleMoodClick(mood)}
                                disabled={isLoading && currentMood !== mood}
                            >
                                {mood.charAt(0).toUpperCase() + mood.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="current-audio">
                        <p> <i className="fa-solid fa-music"></i>
                            {currentMood && tracks[currentMood] && tracks[currentMood][currentIndex]
                                ? `  ${tracks[currentMood][currentIndex].displayName}.mp3`
                                : 'Aucune Ost chargé'}
                        </p>
                    </div>

                    <audio ref={audioRef} />
                </>
            )}
        </div>
    );
};

export default Ost;