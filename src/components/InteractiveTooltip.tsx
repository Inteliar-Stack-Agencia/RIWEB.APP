import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    active?: boolean;
}

export function InteractiveTooltip({ text, children, position = 'top', active = true }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(active);

    if (!isVisible) return <>{children}</>;

    const posStyles: Record<string, React.CSSProperties> = {
        top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-10px)' },
        bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(10px)' },
        left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-10px)' },
        right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(10px)' }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {children}
            <div style={{
                position: 'absolute',
                zIndex: 2000,
                width: '200px',
                padding: '1rem',
                background: 'var(--color-cta)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.8rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                fontWeight: 500,
                lineHeight: 1.4,
                ...posStyles[position]
            }}>
                <div style={{ marginBottom: '0.5rem' }}>{text}</div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                    style={{
                        background: 'white', color: 'var(--color-cta)',
                        border: 'none', borderRadius: '4px', padding: '2px 8px',
                        fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    OK
                </button>
                {/* Arrow */}
                <div style={{
                    position: 'absolute',
                    width: '0', height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: position === 'top' ? '6px solid var(--color-cta)' : 'none',
                    borderBottom: position === 'bottom' ? '6px solid var(--color-cta)' : 'none',
                    left: '50%', transform: 'translateX(-50%)',
                    bottom: position === 'top' ? '-6px' : 'auto',
                    top: position === 'bottom' ? '-6px' : 'auto',
                }} />
            </div>
        </div>
    );
}
