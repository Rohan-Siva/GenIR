import React, { useState, useEffect, useRef } from 'react';
import './RightDrawer.less';

interface RightDrawerProps {
    isOpen?: boolean;
    onClose?: () => void;
    width?: string;
    children?: React.ReactNode;
    title?: string;
    position?: 'right' | 'left';
    showFooter?: boolean;
    footerContent?: React.ReactNode;
}

const RightDrawer: React.FC<RightDrawerProps> = ({
                                                     isOpen = false,
                                                     onClose,
                                                     width = '350px',
                                                     children,
                                                     title = 'rawer',
                                                     position = 'right',
                                                     showFooter = false,
                                                     footerContent = null
                                                 }) => {
    const [isVisible, setIsVisible] = useState(isOpen);
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsVisible(isOpen);

    }, [isOpen]);



    // Close drawer with escape key
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Handle close button click
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className={`rightdrawer-container ${isVisible ? 'container-maxWidth' : 'container-NoWidth'}`}>

            <div
                ref={drawerRef}
                className={`rightdrawer-panel ${position} ${isVisible ? 'open' : ''}`}
                style={{ width }}
            >
                <div className="rightdrawer-header">
                    {title && <h3>{title}</h3>}
                    <button onClick={handleClose}>×</button>
                </div>

                <div className="rightdrawer-content">
                    {children}
                </div>

                {showFooter && (
                    <div className="rightdrawer-footer">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightDrawer;