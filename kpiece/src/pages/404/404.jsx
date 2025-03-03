import React from 'react';
import './404.css';

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <h2>Cette page n'a jamais existé</h2>
            <img src="https://kpiece2.s3.eu-west-3.amazonaws.com/img/assets/eyes.png" alt="eyes"/>
        </div>
    );
};

export default NotFoundPage;