import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <a href="/"><h1>KPIECE</h1></a>
            <nav className="header-nav">
                <ul>
                    <li><a href="/">Dernières sorties</a></li>
                    <li><a href="/tomes">Tomes</a></li>
                    <li><a href="/arcs">Arcs</a></li>
                </ul>
            </nav>
            <div className="header-search">
                <input type="text" placeholder="..." />
                <button><i className="fa-solid fa-magnifying-glass"></i></button>
            </div>
        </header>
    );
};

export default Header;
