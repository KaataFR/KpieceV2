import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const { searchtext } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Search component mounted, searchtext:', searchtext);

    // Afficher les trois premières lettres de searchtext
    if (typeof searchtext === 'string') {
      const firstThreeLetters = searchtext.substring(0, 3);
      console.log('Les trois premières lettres de searchtext :', firstThreeLetters);
    } else {
      console.log('searchtext n\'est pas une chaîne de caractères');
    }

    const fetchSearchResults = async () => {
      try {
        const response = await fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/search.json');
        const data = await response.json();
        console.log('Fetched data:', data);

        let filteredResults = [];

        if (!isNaN(searchtext)) {
          // Si searchtext est un nombre : recherche par numéro de scan
          const scanNumber = parseInt(searchtext, 10);
          console.log('Recherche par scanNumber:', scanNumber);
          filteredResults = data.filter(item =>
            scanNumber >= item.firstscan && scanNumber <= item.lastscan
          );
        } else {
          // Si searchtext est du texte : recherche par nom d'arc
          console.log('Recherche par texte:', searchtext.toLowerCase());
          filteredResults = data.filter(item =>
            item.arc && item.arc.toLowerCase().startsWith(searchtext.toLowerCase().substring(0, 3))
          );          
        }

        console.log('Filtered results:', filteredResults);
        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du fetch:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchtext]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="search-page">
      <h1>Résultat pour : "{searchtext}"</h1>
      <div className="search-results">
        {results.length === 0 ? (
          <div>Pas de résultat trouvé</div>
        ) : (
          results.map((result, index) => (
            <Link
              key={index}
              to={`/arcs/${result.arc}`}
              className="arc-bubble"
              style={{
                backgroundImage: `url(https://kpiece2.s3.eu-west-3.amazonaws.com/img/arcs/${result.arc}.webp)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="arc-name">{result.arcname}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;
