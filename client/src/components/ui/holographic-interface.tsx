import React, { useEffect, useRef } from 'react';

interface BentoItemProps {
    className?: string;
    children: React.ReactNode;
}

// Reusable BentoItem component with 3D tilt and spotlight effects
const BentoItem: React.FC<BentoItemProps> = ({ className = '', children }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const item = itemRef.current;
        if (!item) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;

            // Spotlight effect
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt effect
            const rotateX = (y - height / 2) / 20; // Adjust divisor for sensitivity
            const rotateY = -(x - width / 2) / 20;
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        };

        const handleMouseLeave = () => {
            item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        };

        item.addEventListener('mousemove', handleMouseMove);
        item.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            item.removeEventListener('mousemove', handleMouseMove);
            item.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div ref={itemRef} className={`bento-item ${className}`}>
            {children}
        </div>
    );
};

export default BentoItem;
