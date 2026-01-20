
import React, { useState, useEffect } from 'react';
import { SparePart } from '../types';
import { CloseIcon, LightBulbIcon, CheckCircleIcon } from './icons';

interface SparePartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: SparePart) => void;
  existingPart: SparePart | null;
}

export const SparePartModal: React.FC<SparePartModalProps> = ({ isOpen, onClose, onSave, existingPart }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [unit, setUnit] = useState('');
  const [cost, setCost] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);

  // Estados para a calculadora FO 044
  const [showCalc, setShowCalc] = useState(false);
  const [avgConsumo, setAvgConsumo] = useState(0);
  const [leadTime, setLeadTime] = useState(0);

  useEffect(() => {
    if (existingPart) {
      setId(existingPart.id);
      setName(existingPart.name);
      setLocation(existingPart.location);
      setUnit(existingPart.unit);
      setCost(existingPart.cost);
      setMinStock(existingPart.minStock);
      setCurrentStock(existingPart.currentStock);
    } else {
      setId('');
      setName('');
      setLocation('');
      setUnit('PÇ');
      setCost(0);
      setMinStock(0);
      setCurrentStock(0);
    }
  }, [existingPart, isOpen]);

  const aplicarSistematicaFO044 = () => {
    // Regra: Consumo Mensal * (Tempo de Entrega em meses)
    // Obs: Considerar margem de 10% no tempo de entrega
    const leadTimeComSeguranca = leadTime * 1.1;
    const tempoEmMeses = leadTimeComSeguranca / 30;
    const calculoReferencia = avgConsumo * tempoEmMeses;

    // Critério de Arredondamento FO 044:
    // 0,01 a 0,99 = 1 | 1,01 a 1,50 = 1 | 1,51 a 1,99 = 2 | 2,01 a 2,50 = 2...
    let arredondado = 0;
    const decimal = calculoReferencia % 1;
    const inteiro = Math.floor(calculoReferencia);

    if (calculoReferencia <= 0) arredondado = 0;
    else if (decimal > 0 && decimal <= 0.50) arredondado = inteiro > 0 ? inteiro : 1;
    else if (decimal > 0.50) arredondado = inteiro + 1;
    else arredondado = inteiro;

    setMinStock(arredondado);
    setShowCalc(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id, name, location, unit, cost, minStock, currentStock });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-8 py-6 bg-slate-800 text-white flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Cadastro de Item Técnico</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Inventário FO 044</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><CloseIcon /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Cód. Referência</label>
              <input type="text" value={id} onChange={e => setId(e.target.value)} required disabled={!!existingPart} className="form-input w-full h-12 font-bold" placeholder="EX: ROL-6202" />
            </div>
             <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Unidade Medida</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} required className="form-input w-full h-12 font-bold" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Descrição do Produto</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="form-input w-full h-12 font-bold" placeholder="Nome técnico da peça" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-1 flex justify-between">
                    Estoque Mínimo
                    <button type="button" onClick={() => setShowCalc(!showCalc)} className="text-[9px] bg-blue-50 px-2 rounded-full hover:bg-blue-100 transition-colors">USAR FO-044</button>
                </label>
                <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} required className="form-input w-full h-14 text-xl font-black text-blue-700 bg-blue-50/30 border-blue-100" />
                
                {showCalc && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-blue-200 shadow-2xl rounded-2xl z-20 animate-fade-in">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3">Calculadora Sistemática FO 044</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400">Consumo Médio Mensal</label>
                                <input type="number" value={avgConsumo} onChange={e => setAvgConsumo(Number(e.target.value))} className="w-full form-input h-8 text-xs" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-slate-400">Tempo Entrega (Dias)</label>
                                <input type="number" value={leadTime} onChange={e => setLeadTime(Number(e.target.value))} className="w-full form-input h-8 text-xs" />
                            </div>
                            <p className="text-[8px] text-slate-400 italic">* Inclui margem de 10% de segurança normativa.</p>
                            <button type="button" onClick={aplicarSistematicaFO044} className="w-full py-2 bg-blue-600 text-white font-black text-[10px] uppercase rounded-lg">Aplicar Cálculo</button>
                        </div>
                    </div>
                )}
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Saldo em Estoque</label>
              <input type="number" value={currentStock} onChange={e => setCurrentStock(Number(e.target.value))} required className="form-input w-full h-14 text-xl font-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Localização (Endereço)</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="form-input w-full h-12" placeholder="Ex: PRAT-A1-G2" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Custo Unitário (R$)</label>
              <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} required step="0.01" className="form-input w-full h-12 font-mono" />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-600 uppercase text-[10px]">Cancelar</button>
          <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4"/> Salvar Item Técnico
          </button>
        </div>
      </form>
    </div>
  );
};
