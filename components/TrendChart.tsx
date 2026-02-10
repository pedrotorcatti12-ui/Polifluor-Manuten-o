
import React from 'react';

interface TrendChartProps {
    data: { label: string; value: number }[];
    title: string;
    color: string;
    yLabel?: string;
    targetValue?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, title, color, yLabel, targetValue }) => {
    // Configurações do SVG
    const width = 100;
    const height = 50;
    const padding = 5;
    
    // Cálculos de escala
    const maxVal = Math.max(...data.map(d => d.value), targetValue || 0) * 1.2;
    const minVal = 0;
    const range = maxVal - minVal;
    
    // Função para mapear coordenadas
    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const getY = (value: number) => height - padding - ((value - minVal) / range) * (height - 2 * padding);

    // Gerar caminho da linha (Polyline)
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
    
    // Linha de meta (Target)
    const targetY = targetValue ? getY(targetValue) : null;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm flex flex-col h-full">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">{title}</h3>
            
            <div className="flex-1 relative w-full h-32">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines (Opcional) */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="0.5" />
                    
                    {/* Linha de Meta */}
                    {targetY !== null && (
                        <line 
                            x1={padding} y1={targetY} x2={width - padding} y2={targetY} 
                            stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="2" 
                        />
                    )}

                    {/* Linha de Dados */}
                    <polyline 
                        points={points} 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Pontos */}
                    {data.map((d, i) => (
                        <circle 
                            key={i} 
                            cx={getX(i)} 
                            cy={getY(d.value)} 
                            r="1.5" 
                            fill="white" 
                            stroke={color} 
                            strokeWidth="0.5" 
                            className="hover:r-2 transition-all duration-300"
                        >
                            <title>{d.label}: {d.value}</title>
                        </circle>
                    ))}
                </svg>
            </div>

            {/* Labels do Eixo X */}
            <div className="flex justify-between mt-2 px-1">
                {data.map((d, i) => (
                    // Mostrar apenas o primeiro, meio e último rótulo para não poluir
                    (i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
                        <span key={i} className="text-[8px] font-bold text-slate-400 uppercase">{d.label}</span>
                    )
                ))}
            </div>
        </div>
    );
};
