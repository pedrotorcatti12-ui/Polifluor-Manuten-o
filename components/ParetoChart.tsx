
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-lg font-bold mb-4">{title}</h3>
            <div className="flex items-center justify-center h-64 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Nenhum dado de falha para exibir.<br/>Execute manutenções corretivas e categorize-as para popular este gráfico.</p>
            </div>
        </div>
    );
  }
  
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Gera o caminho da linha de percentual acumulado
  const linePath = chartData.map((d, i, arr) => {
      const x = (i + 0.5) * (100 / arr.length);
      const y = 100 - d.cumulativePercentage;
      return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
        <div className="relative h-72">
            {/* Eixo Y - Frequência */}
            <div className="absolute top-0 left-0 -translate-x-full pr-2 h-full flex flex-col justify-between text-[10px] font-black text-gray-400">
                <span>{Math.ceil(maxCount)}</span>
                <span>0</span>
            </div>
            
            {/* Eixo Y - Percentual */}
            <div className="absolute top-0 right-0 translate-x-full pl-2 h-full flex flex-col justify-between text-[10px] font-black text-gray-400">
                <span>100%</span>
                <span>0%</span>
            </div>

            {/* Área do Gráfico */}
            <div className="relative h-full flex justify-around items-end gap-1 border-l border-b border-gray-300 dark:border-gray-600">
                {chartData.map(item => (
                    <div key={item.category} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div 
                            className="relative w-3/4 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm" 
                            style={{ height: `${(item.count / maxCount) * 100}%` }}
                        >
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded z-10 whitespace-nowrap shadow-xl">
                                {item.category}: {item.count}
                            </div>
                        </div>
                    </div>
                ))}

                {/* SVG para a linha de Pareto */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                        points={linePath}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                    {chartData.map((d, i, arr) => {
                         const x = (i + 0.5) * (100 / arr.length);
                         const y = 100 - d.cumulativePercentage;
                         return <circle key={i} cx={x} cy={y} r="1" fill="#ef4444" />
                    })}
                </svg>
            </div>
            
            {/* Eixo X - Categorias */}
            <div className="flex justify-around mt-2 text-[10px] font-bold text-gray-500 uppercase">
                 {chartData.map(item => (
                    <span key={item.category} className="flex-1 text-center truncate px-1" title={item.category}>
                        {item.category.substring(0, 3)}
                    </span>
                ))}
            </div>

            {/* Legenda */}
            <div className="flex justify-center items-center gap-6 mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span>Frequência</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-0.5 bg-red-500"></div>
                    <span>% Acumulada</span>
                </div>
            </div>
        </div>
    </div>
  );
};
