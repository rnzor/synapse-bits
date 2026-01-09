import React, { useRef, useEffect } from 'react';

const VibeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const setSize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const particles: {x: number, y: number, vx: number, vy: number, size: number}[] = [];
    const particleCount = Math.min(100, Math.floor((width * height) / 15000));
    
    // Init Particles
    for(let i=0; i<particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Draw Particles
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'; // Indigo-ish
        
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Mouse interaction
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < 200) {
                p.x -= dx * 0.01;
                p.y -= dy * 0.01;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);

                if (dist2 < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist2 / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('resize', setSize);
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom right, #030712, #0f172a)' }}
    />
  );
};

export default VibeBackground;
