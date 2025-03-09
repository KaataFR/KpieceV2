import React from 'react';
import './Header.css';

const Header = () => {
    const [searchText, setSearchText] = React.useState('');

    const handleSearch = () => {
        if (searchText.trim()) {
            window.location.href = `/search/${searchText}`;
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className="header">
            <a href="/"><h1>KPIECE</h1></a>
            <nav className="header-nav">
                <ul>
                    <li><a href="/">Dernières sorties</a></li>                
                    <li><a href="/saga">Saga</a></li>
                    <li><a href="/tomes/0">Tomes</a></li>
                </ul>
            </nav>
            <div className="header-search">
                <input 
                    type="text" 
                    placeholder="Rechercher.." 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)} 
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearch}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;
