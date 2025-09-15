import React from 'react';

/**
 * Disconnect Screen
 * Static frosted glass medallion without CPU-intensive animations
 */
export const DisconnectScreen: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Static background with gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.95) 100%)'
        }}
      />
      
      {/* Static aurora-like background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(45deg, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
              linear-gradient(-45deg, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
              linear-gradient(-135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>
      
      {/* Glass medallion with frosted effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Static glowing orb effect */}
          <div 
            className="absolute inset-0 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          
          {/* Frosted glass background */}
          <div 
            className="absolute inset-0 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
              backdropFilter: 'blur(20px)',
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: `
                inset 0 0 40px rgba(255,255,255,0.1), 
                0 0 80px rgba(34, 211, 238, 0.5),
                0 0 120px rgba(168, 85, 247, 0.4),
                0 0 160px rgba(34, 211, 238, 0.3),
                0 0 200px rgba(168, 85, 247, 0.2)
              `,
            }}
          />
          
          {/* Embossed logo */}
          <div className="relative w-96 h-96 flex items-center justify-center">
            <img 
              src="/logo-neon.png" 
              alt="Archon" 
              className="w-64 h-64 z-10"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 -2px 4px rgba(255,255,255,0.3))',
                opacity: 0.9,
                mixBlendMode: 'screen',
              }}
            />
          </div>
          
          {/* Disconnected Text - Glass style with red glow */}
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div 
              className="px-8 py-4 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.2)',
              }}
            >
              <span 
                className="text-2xl font-medium tracking-wider"
                style={{
                  color: 'rgba(239, 68, 68, 0.9)',
                  textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.6)',
                }}
              >
                DISCONNECTED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};