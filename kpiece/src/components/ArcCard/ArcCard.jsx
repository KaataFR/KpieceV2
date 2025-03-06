import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ArcCard.css';

const ArcCard = ({ saga, arcs }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="arc-card">

            <div className="arc-card-header">

                <button onClick={toggleExpand}>
                    {isExpanded ? <i className="fa-solid fa-minus"></i> : <i className="fa-solid fa-plus"></i>}
                </button>

                <h3>Saga {saga}</h3>

            </div>


            {isExpanded && (
                <div className="arc-list">
                    {arcs.map((arc, index) => (
                        <div key={index} className="arc-item">
                            <Link to={`/saga/${arc.saganame}/${arc.arcssearch}`}>
                                <img src={arc.arcimg} alt={arc.arc} />
                                <p>{arc.arc}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

ArcCard.propTypes = {
    saga: PropTypes.string.isRequired,
    arcs: PropTypes.arrayOf(
        PropTypes.shape({
            arc: PropTypes.string.isRequired,
            arcimg: PropTypes.string.isRequired
        })
    ).isRequired
};

export default ArcCard;