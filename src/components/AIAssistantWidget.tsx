import React, { useState, useEffect, useRef } from 'react';
import type { Locale } from '../types';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export function AIAssistantWidget({ locale, auditUrl }: { locale: Locale, auditUrl: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isSpanish = locale === 'es';

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'init',
                text: isSpanish
                    ? `¡Hola! Soy tu RI-Agent. He analizado ${auditUrl} y tengo ideas para modernizarlo. ¿En qué puedo ayudarte?`
                    : `Hi! I'm your RI-Agent. I've analyzed ${auditUrl} and have ideas to modernize it. How can I help you?`,
                sender: 'bot'
            }]);
        }
    }, [isOpen, locale, auditUrl, isSpanish, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulated AI response logic
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: getResponse(input, isSpanish),
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
    };

    const getResponse = (query: string, spanish: boolean) => {
        const q = query.toLowerCase();
        if (q.includes('precio') || q.includes('price') || q.includes('cost')) {
            return spanish
                ? "Nuestros planes de modernización se adaptan a tu escala. El ROI suele ser de 3x en los primeros 6 meses."
                : "Our modernization plans adapt to your scale. ROI is typically 3x within the first 6 months.";
        }
        if (q.includes('vianda') || q.includes('food') || q.includes('producto') || q.includes('product')) {
            return spanish
                ? "He optimizado el catálogo para que las imágenes pesen 80% menos sin perder calidad, mejorando la conversión."
                : "I've optimized the catalog so images weigh 80% less without losing quality, improving conversion.";
        }
        return spanish
            ? "Exacto. Implementando agentes de IA como yo, tu negocio puede atender 24/7 y reducir costos de soporte."
            : "Exactly. By implementing AI agents like me, your business can serve 24/7 and reduce support costs.";
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: 'inherit' }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pulse-button"
                    style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--color-cta)', color: 'white', border: 'none',
                        fontSize: '1.8rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(202,138,4,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    🤖
                </button>
            ) : (
                <div style={{
                    width: '350px', height: '500px', background: '#0F172A',
                    border: '1px solid var(--glass-border)', borderRadius: '20px',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        padding: '1.25rem', background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>RI-Agent Pro</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>

                    <div ref={scrollRef} style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(m => (
                            <div key={m.id} style={{
                                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%', padding: '0.8rem 1rem', borderRadius: '15px',
                                background: m.sender === 'user' ? 'rgba(202,138,4,0.1)' : 'rgba(255,255,255,0.05)',
                                border: m.sender === 'user' ? '1px solid var(--color-cta)' : '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.85rem', lineHeight: 1.4
                            }}>
                                {m.text}
                            </div>
                        ))}
                        {isTyping && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>RI-Agent {isSpanish ? 'escribiendo...' : 'typing...'}</div>}
                    </div>

                    <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={isSpanish ? "Preguntame algo..." : "Ask me anything..."}
                            style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem' }}
                        />
                        <button onClick={handleSend} style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'var(--color-cta)', border: 'none', color: 'white', cursor: 'pointer' }}>➔</button>
                    </div>
                </div>
            )}
        </div>
    );
}
