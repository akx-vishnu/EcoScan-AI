import React from 'react';

const Loader = ({ text = "Processing..." }) => {
    return (
        <div className="loader-container">
            <div className="loader-spinner"></div>
            <p>{text}</p>
        </div>
    );
};

export default Loader;