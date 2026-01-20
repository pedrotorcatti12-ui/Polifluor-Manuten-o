import React, { useMemo } from 'react';

interface ParetoChartProps {
  title: string;
  data: { category: string; count: number }[];
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ title, data }) => {
  const chartData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => b.count - a.count);
    const totalCount = sortedData.reduce((sum, item) => sum + item.count, 0);
    
    if (totalCount === 0) return [];
    
    let cumulativeCount = 0;
    return sortedData.map(item => {
      cumulativeCount += item.count;
      return {
        ...item,
        percentage: (item.count / totalCount) * 100,
        cumulativePercentage: (cumulativeCount / totalCount) * 100,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-gray-700 h-full flex flex-col justify-center items-center">
        <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white mb-4">{title}</h3>
        <p className="text-sm text-slate-400 font-bold text-center">Nenhum dado de falha registrado para este período.</p>
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Caminho da linha de Pareto (coordenadas 0-100 no viewBox)
  const linePath = chartData.map((d, i, arr) => {
    const x = (i + 0.5) * (100 / arr.length);
    const y = 100 - d.cumulativePercentage;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-gray-700">
      <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white mb-8 tracking-tight">{title}</h3>
      
      <div className="relative h-64 mt-4">
        {/* Eixo Y Esquerdo - Frequência */}
        <div className="absolute top-0 left-0 -translate-x-full pr-3 h-full flex flex-col justify-between text-[9px] font-black text-slate-400 uppercase">
          <span>{Math.ceil(maxCount)}</span>
          <span>0</span>
        </div>

        {/* Eixo Y Direito - % Acumulado */}
        <div className="absolute top-0 right-0 translate-x-full pl-3 h-full flex flex-col justify-between text-[9px] font-black text-red-500 uppercase">
          <span>100%</span>
          <span>0%</span>
        </div>

        {/* Container Principal do Gráfico */}
        <div className="relative h-full w-full flex items-end gap-1 border-l-2 border-b-2 border-slate-100 dark:border-gray-700">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex-1 h-full flex flex-col justify-end group relative">
              {/* Barra de Frequência */}
              <div 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all rounded-t-sm"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md z-50 whitespace-nowrap shadow-xl">
                  {item.category}: {item.count} ocorrências
                </div>
              </div>
            </div>
          ))}

          {/* SVG para Curva de Pareto */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={linePath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {chartData.map((d, i, arr) => {
              const x = (i + 0.5) * (100 / arr.length);
              const y = 100 - d.cumulativePercentage;
              return (
                <circle 
                  key={i} 
                  cx={x} 
                  cy={y} 
                  r="1.5" 
                  fill="#ef4444" 
                  className="stroke-white dark:stroke-gray-800 stroke-[0.5]" 
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Eixo X - Categorias (Truncado para legibilidade) */}
      <div className="flex mt-4 gap-1">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex-1 text-center truncate text-[8px] font-black text-slate-400 uppercase" title={item.category}>
            {item.category.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Legenda Estilizada */}
      <div className="mt-10 flex justify-center items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Frequência</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-red-500"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% Acumulada</span>
        </div>
      </div>
    </div>
  );
};

export default ParetoChart;