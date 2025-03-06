import React from 'react';
import './ScanBar.css';
import Ost from '../Ost/Ost';

function ScanBar({ onFullScreen, onVerticalScan }) {
    const [verticalIcon, setVerticalIcon] = React.useState(true);

    const handleVerticalScanClick = () => {
        setVerticalIcon(!verticalIcon);
        // Call the prop onVerticalScan, configured externally.
        if (onVerticalScan) {
            onVerticalScan();
        }
    };

    return (
        <div className='scan-bar'>
            <button onClick={onFullScreen} className='scan-bar-button'>
                <i className="fa-solid fa-expand"></i>
            </button>
            <button onClick={handleVerticalScanClick} className='scan-bar-button'>
                <i className={`fa-solid ${verticalIcon ? 'fa-arrows-up-down' : 'fa-arrows-left-right'}`}></i>
            </button>
                <Ost />
            
        </div>
    );
}

export default ScanBar;
