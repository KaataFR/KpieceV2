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

    // Create style object for scan-bar based on vertical mode
    const scanBarStyle = !verticalIcon ? {
        position: 'sticky',
        top: 0,
        background: 'black',
        borderRadius: 0
    } : {};

    return (
        <div className='scan-bar' style={scanBarStyle}>
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
