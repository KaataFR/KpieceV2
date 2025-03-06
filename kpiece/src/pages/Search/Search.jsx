import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const { searchtext } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof searchtext === 'string') {
      const firstThreeLetters = searchtext.substring(0, 3);
      console.log('First three letters:', firstThreeLetters);
    }

    const fetchSearchResults = async () => {
      try {
        const response = await fetch('https://kpiece2.s3.eu-west-3.amazonaws.com/data/search.json');
        const data = await response.json();

        let filteredResults = [];

        if (!isNaN(searchtext)) {
          const scanNumber = parseInt(searchtext, 10);
          filteredResults = data.filter(
            item => scanNumber >= item.firstscan && scanNumber <= item.lastscan
          );
        } else {
          filteredResults = data.filter(
            item =>
              item.arc &&
              item.arc.toLowerCase().startsWith(searchtext.toLowerCase().substring(0, 3))
          );
        }

        setResults(filteredResults);
        setLoading(false);
      } catch (err) {
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
      <h1>Résultat pour : "{searchtext}"</h1>
      <div className="search-results">
        {results.length === 0 ? (
          <div>Pas de résultat trouvé</div>
        ) : (
          results.map((result, index) => (

            <div key={index} className="result-item">


              {!isNaN(searchtext) && (
                <div className="arc-bubble arc-chapter">
                  <Link to={`/scan/${result.saga}/${result.arc}/${searchtext}/01`}>
                    CHAPITRE {searchtext}
                  </Link>
                </div>
              )}

              <Link
                to={`/saga/${result.saga}/${result.arc}`}
                className="arc-bubble"
                style={{
                  backgroundImage: `url(https://kpiece2.s3.eu-west-3.amazonaws.com/img/arcs/${result.arc}.webp)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="arc-name">{result.arcname}</div>
              </Link>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;
