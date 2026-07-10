import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Sparkles, User, ShieldAlert, Clock, 
  HelpCircle, Trash2, BookOpen, AlertCircle, HeartHandshake, CheckCircle
} from 'lucide-react';
import { Retreat } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AssistantViewProps {
  retreat: Retreat;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ retreat }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `¡Hola, facilitador! Soy tu mentor y asistente inteligente de **Retiro Studio**. 

Estoy aquí para ayudarte a resolver cualquier contingencia, guiar procesos grupales complejos, proponer variaciones o apoyarte en situaciones críticas en tiempo real.

Puedes escribir libremente tu duda o seleccionar una de nuestras **Consultas de Contingencia** rápidas a continuación:`,
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick intervention options
  const quickOptions = [
    { label: '🤫 Baja participación', query: 'Tengo poca participación, el grupo está callado y no habla.' },
    { label: '😭 Llanto / Contención', query: 'Un participante comenzó a llorar intensamente en plena dinámica, ¿cómo lo contengo?' },
    { label: '⏰ Retraso en agenda', query: 'Vamos con 30 minutos de retraso en la agenda, ¿qué hago para reajustar sin perder profundidad?' },
    { label: '😴 Baja energía', query: 'El grupo tiene sueño y pesadez en el bloque de la tarde.' },
    { label: '🔥 Conflicto grupal', query: 'Siento tensión o conflicto explícito entre dos participantes.' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Pack chat history for the endpoint
      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentRetreatId: retreat.id || undefined,
          chatHistory: chatHistory
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: 'reply_' + Date.now(),
        sender: 'assistant',
        text: data.reply || "Disculpa, no pude procesar tu solicitud.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          sender: 'assistant',
          text: "⚠️ Ocurrió un error al conectar con el asistente. Por favor verifica tu conexión.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el chat con el mentor?")) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Conversación reiniciada. ¿En qué situación técnica o de facilitación necesitas apoyo hoy?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Helper to format text replacing markdown with html-like bold/list structures
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Check for headings
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-serif text-base font-bold text-[#154539] mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-serif text-lg font-bold text-[#154539] mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-serif text-xl font-bold text-[#154539] mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }
      
      // Check for bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleaned = line.trim().substring(2);
        return (
          <li key={idx} className="list-disc list-inside text-xs text-gray-700 font-light ml-4 my-1">
            {parseBoldText(cleaned)}
          </li>
        );
      }

      // Check for numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const cleaned = line.trim().replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="list-decimal list-inside text-xs text-gray-700 font-light ml-4 my-1">
            {parseBoldText(cleaned)}
          </li>
        );
      }

      return <p key={idx} className="text-xs text-gray-700 font-light my-2 leading-relaxed">{parseBoldText(line)}</p>;
    });
  };

  // Helper to process **bold** markdown tags inside lines
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-gray-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="assistant-view-root" className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)] animate-fade-in">
      
      {/* Left Column: Chat Area (spans 3) */}
      <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-[#154539] text-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-[#C5A059]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-gray-900">Mentor de Facilitadores</h3>
              <p className="text-[10px] text-gray-400 font-light">Asistencia en vivo consciente para dinámicas de grupo.</p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
            title="Limpiar chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div 
                key={m.id} 
                className={`flex items-start space-x-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                  isUser ? 'bg-[#C5A059]' : 'bg-[#154539]'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#C5A059]" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-xl max-w-[85%] border shadow-xs ${
                  isUser 
                    ? 'bg-[#154539] text-white border-[#154539] rounded-tr-none' 
                    : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                }`}>
                  {isUser ? (
                    <p className="text-xs font-light leading-relaxed whitespace-pre-line">{m.text}</p>
                  ) : (
                    <div className="space-y-1">
                      {renderMessageText(m.text)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#154539] text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-xl rounded-tl-none border border-gray-100 shadow-xs max-w-[85%] flex items-center space-x-2">
                <span className="w-2 h-2 bg-[#C5A059] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#154539] rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-[#C5A059] rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Options Bar */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-2">Presiona una contingencia común para asesoría inmediata:</p>
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(opt.query)}
                className="text-[11px] px-3 py-1.5 bg-gray-50 hover:bg-[#154539] hover:text-white border border-gray-200 rounded-lg font-medium transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-4 border-t border-gray-100 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Haz una pregunta o describe el imprevisto de tu grupo..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#154539] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-[#154539] hover:bg-[#1a5143] text-white rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Right Column: Context & Guidelines (spans 1) */}
      <div className="space-y-6 hidden lg:block">
        
        {/* Active Context card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h4 className="font-serif text-sm font-bold text-[#154539] border-b border-gray-100 pb-2">Contexto Compartido</h4>
          {retreat.id ? (
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-[#C5A059] font-semibold text-xs">
                <HeartHandshake className="w-4 h-4" />
                <span>Retiro en curso conectado</span>
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{retreat.name}</p>
              <div className="space-y-1.5 text-[11px] text-gray-500 font-light">
                <p><strong>Objetivo:</strong> {retreat.goal}</p>
                <p className="pt-1.5 border-t border-gray-50"><strong>Participantes:</strong> {retreat.participantsProfile}</p>
                <p><strong>Energía deseada:</strong> {retreat.desiredEnergy}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <AlertCircle className="w-8 h-8 text-[#C5A059] mx-auto opacity-75" />
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                No hay un retiro cargado en curso. El asistente responderá de manera general a tus dudas de facilitación.
              </p>
            </div>
          )}
        </div>

        {/* Faciliation Golden Rules card */}
        <div className="bg-gradient-to-br from-[#154539] to-[#0f342b] text-white rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-serif text-sm font-bold text-[#C5A059]">Pautas de Contención</h4>
          <ul className="space-y-2.5 text-[11px] font-light text-[#d0e0db]">
            <li className="flex items-start">
              <span className="text-[#C5A059] font-bold mr-1.5">1.</span>
              <span><strong>No repares la catarsis:</strong> Deja que las lágrimas fluyan libres. El llanto es el sistema de descarga del cuerpo.</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#C5A059] font-bold mr-1.5">2.</span>
              <span><strong>Sostén el silencio:</strong> El silencio no es tiempo perdido; es el espacio donde el participante asimila el despertar.</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#C5A059] font-bold mr-1.5">3.</span>
              <span><strong>Enraíza físicamente:</strong> Si alguien sufre de pánico, pídele tocar el suelo o respirar sintonizando tus latidos.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
