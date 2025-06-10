import React from 'react';

interface WmsuLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

const WmsuLogo: React.FC<WmsuLogoProps> = ({ className = '', width = 150, height = 150 }) => {
    return (
        <img
            src="/storage/images/wmsu_logo.png"
            alt="WMSU Logo"
            width={width}
            height={height}
            className={className}
        />
    );
};

export default WmsuLogo;
