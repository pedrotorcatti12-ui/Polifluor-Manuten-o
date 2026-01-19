
import React, { useState, useRef, useEffect } from 'react';
// FIX: Replaced non-existent BrainCircuitIcon with LightBulbIcon.
import { LightBulbIcon, CloseIcon, ArrowPathIcon } from './icons';
import { Page, Equipment, SparePart, MaintenanceStatus } from '../types';
import { useAppContext } from '../contexts/AppContext';
// FIX: Imported missing types from '@google/genai' to resolve multiple 'Cannot find name' errors.
import { GoogleGenAI, Chat, FunctionDeclaration, FunctionCall, Type } from '@google/genai';

interface Message {
    sender: 'user' | 'model';
    text: string;
}

interface AIChatWidgetProps {
    equipmentData: Equipment[];
    inventoryData: SparePart[];
}

const suggestions: Partial<{ [key in Page]: { prompt: string; message: string }[] }> = {
    dashboard: [{ prompt: "Faça um resumo da saúde do sistema", message: "Qual o status geral do sistema?" }],
    schedule: [
        { prompt: "Programação de um equipamento", message: "Qual a programação do equipamento TC-01 para 2026?" },
        { prompt: "Me leve para o Cronograma", message: "Navegue para a página do cronograma." }
    ],
    inventory: [
        { prompt: "Verificar estoque de uma peça", message: "Temos 'Rolamento 6202 ZZ' em estoque?" },
        { prompt: "Me leve para o Estoque", message: "Navegue para a página de estoque." }
    ],
    equipment: [{ prompt: "Liste todas as prensas", message: "Liste todas as prensas hidráulicas." }],
};

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ equipmentData, inventoryData }) => {
    const { currentPage, setCurrentPage } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSession = useRef<Chat | null>(null);

    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const widgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Ferramentas da IA
    const tools: FunctionDeclaration[] = [
        {
            name: 'navigateToPage',
            parameters: {
                type: Type.OBJECT,
                description: 'Navega para uma página específica do sistema.',
                properties: { page: { type: Type.STRING, description: 'O nome da página. Opções: dashboard, schedule, inventory, settings, equipment, reports, history, search_os, quality, work_orders, work_center, managerial_report, advanced_reports.' } },
                required: ['page']
            }
        },
        {
            name: 'findEquipment',
            parameters: {
                type: Type.OBJECT,
                description: 'Busca por equipamentos com base em um nome, tipo ou ID.',
                properties: { query: { type: Type.STRING, description: 'O termo de busca. Ex: "prensa", "TC-01".' } },
                required: ['query']
            }
        },
        {
            name: 'getEquipmentSchedule',
            parameters: {
                type: Type.OBJECT,
                description: 'Busca a programação de manutenção de um equipamento para um ano.',
                properties: {
                    equipmentId: { type: Type.STRING, description: 'O ID do equipamento. Ex: "TC-01".' },
                    year: { type: Type.NUMBER, description: 'O ano. Padrão é 2026.' }
                },
                required: ['equipmentId']
            }
        },
        {
            name: 'checkInventory',
            parameters: {
                type: Type.OBJECT,
                description: 'Verifica o estoque de uma peça.',
                properties: { partNameOrId: { type: Type.STRING, description: 'O nome ou ID da peça. Ex: "Rolamento 6202 ZZ".' } },
                required: ['partNameOrId']
            }
        },
        {
            name: 'analyzeSystemHealth',
            parameters: {
                type: Type.OBJECT,
                description: "Analisa o estado atual do sistema, procurando por tarefas de manutenção atrasadas e itens de estoque em nível crítico.",
                properties: {},
                required: []
            }
        }
    ];

    const systemInstruction = "Você é um assistente prestativo para um sistema de gerenciamento de manutenção. Seja conciso e foque em tópicos de manutenção. No início da conversa, sempre use a ferramenta `analyzeSystemHealth` para fornecer um resumo proativo dos problemas atuais (tarefas atrasadas, estoque crítico) antes de saudar o usuário. Após a análise, você pode saudar o usuário e apresentar o resumo. Você pode navegar entre páginas, encontrar equipamentos, verificar a programação de um equipamento e consultar o estoque de peças. Sempre confirme a ação para o usuário após usar uma ferramenta.";

    const executeTool = (call: FunctionCall) => {
        let result: any;
        switch (call.name) {
            case 'navigateToPage':
                setCurrentPage(call.args.page as Page);
                result = { status: "SUCCESS", message: `Navegando para a página ${call.args.page}.` };
                break;
            case 'findEquipment':
                const query = String(call.args.query).toLowerCase();
                const results = equipmentData.filter(eq => eq.name.toLowerCase().includes(query) || eq.id.toLowerCase().includes(query));
                result = { equipmentFound: results.map(r => `${r.id} (${r.name})`) };
                break;
            case 'getEquipmentSchedule':
                const id = String(call.args.equipmentId).toUpperCase();
                const year = call.args.year ? Number(call.args.year) : 2026;
                const equipment = equipmentData.find(eq => eq.id.toUpperCase() === id);
                if (equipment) {
                    const scheduleForYear = equipment.schedule.filter(task => task.year === year);
                    result = { schedule: scheduleForYear.map(task => `- ${task.month}: ${task.description} (${task.type})`).join('\n') || `Nenhuma tarefa para ${id} em ${year}.`};
                } else {
                    result = { error: `Equipamento ${id} não encontrado.` };
                }
                break;
            case 'checkInventory':
                const partQuery = String(call.args.partNameOrId).toLowerCase();
                const part = inventoryData.find(p => p.id.toLowerCase() === partQuery || p.name.toLowerCase() === partQuery);
                if (part) {
                     result = { partInfo: { id: part.id, name: part.name, currentStock: part.currentStock, minStock: part.minStock, unit: part.unit, location: part.location } };
                } else {
                     result = { error: `Peça "${call.args.partNameOrId}" não encontrada.` };
                }
                break;
            case 'analyzeSystemHealth':
                const delayedTasks = equipmentData.flatMap(eq => eq.schedule.filter(task => task.status === MaintenanceStatus.Delayed));
                const criticalStock = inventoryData.filter(p => p.currentStock < p.minStock);
                result = { delayedTaskCount: delayedTasks.length, criticalStockCount: criticalStock.length };
                break;
            default:
                result = { error: "Ação não reconhecida." };
        }
        return result;
    };

    const getModelResponse = async (prompt: string | { toolResponses: any }) => {
        if (!chatSession.current) return;
        setIsLoading(true);
        try {
            // FIX: Ensure chat.sendMessage only accepts the message parameter. 
            // In case of tool responses, passing them according to SDK requirements.
            let response;
            if (typeof prompt === 'string') {
                response = await chatSession.current.sendMessage({ message: prompt });
            } else {
                response = await chatSession.current.sendMessage(prompt as any);
            }
            
            while (response.functionCalls && response.functionCalls.length > 0) {
                const call = response.functionCalls[0];
                const toolResult = executeTool(call);
                
                response = await chatSession.current.sendMessage({
                    toolResponses: [{
                        functionResponses: [{ id: call.id, name: call.name, response: toolResult }]
                    }]
                } as any);
            }

            const modelMessage: Message = { sender: 'model', text: response.text || '' };
            setMessages(prev => {
                // Se a mensagem anterior for "Analisando...", substitua-a.
                if (prev.length > 0 && prev[prev.length-1].text.startsWith('Analisando')) {
                    const newMessages = prev.slice(0, prev.length -1);
                    return [...newMessages, modelMessage];
                }
                return [...prev, modelMessage];
            });

        } catch (error) {
            console.error("Error in getModelResponse:", error);
            const errorMessage: Message = { sender: 'model', text: "Desculpe, ocorreu um erro." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // FIX: Ensure API key is obtained directly from process.env.API_KEY.
            if (!process.env.API_KEY) {
                setMessages([{ sender: 'model', text: "A API_KEY não está configurada. Por favor, configure a variável de ambiente API_KEY para usar o assistente." }]);
                return;
            }

            // FIX: Create new GoogleGenAI instance right before interaction and use named parameter for apiKey.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatSession.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: tools }]
                }
            });

            setMessages([{ sender: 'model', text: 'Analisando a saúde do sistema...' }]);
            getModelResponse("Faça uma análise proativa da saúde do sistema e me dê um resumo, depois me saúde.");
        
        } else {
            chatSession.current = null;
            setMessages([]);
            setInput('');
        }
    }, [isOpen]);

    const handleSend = async (messageToSend?: string) => {
        const currentInput = messageToSend || input;
        if (!currentInput.trim() || isLoading || !chatSession.current) return;

        const userMessage: Message = { sender: 'user', text: currentInput };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        await getModelResponse(currentInput);
    };

    const handleSuggestionClick = (message: string) => {
        setInput(message);
        handleSend(message);
    };
    
    // Drag handlers
    const onMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging || !widgetRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition(prevPos => ({ x: prevPos.x + dx, y: prevPos.y + dy }));
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };
    
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-transform transform hover:scale-110 z-[100]"
                aria-label="Open AI Chat"
            >
                <LightBulbIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div 
                    ref={widgetRef} 
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                    className="fixed bottom-24 right-6 w-full max-w-sm h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 z-[100] animate-fade-in-up"
                >
                    <header onMouseDown={onMouseDown} className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 cursor-move">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Assistente de IA (PRO)</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer">
                            <CloseIcon />
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <ArrowPathIcon className="w-4 h-4 animate-spin"/>
                                            <span className="text-sm">Pensando...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             <div ref={messagesEndRef} />
                        </div>
                    </div>
                     {(suggestions[currentPage] && messages.length > 0 && !messages[0].text.startsWith('Analisando')) && (
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">Sugestões:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {suggestions[currentPage]?.map(s => (
                                    <button key={s.prompt} onClick={() => handleSuggestionClick(s.message)} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900">
                                        {s.prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Pergunte sobre manutenção..."
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading || !chatSession.current}
                            />
                            <button onClick={() => handleSend()} disabled={isLoading || !input.trim() || !chatSession.current} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatWidget;
