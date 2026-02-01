import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { chatWithAI } from '../../api/client';

const ChatbotWidget = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = query;
        setQuery('');
        setHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsTyping(true);

        const response = await chatWithAI(userMsg, context);

        setIsTyping(false);
        setHistory(prev => [...prev, { sender: 'ai', text: response }]);
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '30px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 1000
                    }}
                >
                    <MessageSquare size={28} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                    width: '320px',
                    height: '450px',
                    maxHeight: '80vh',
                    backgroundColor: '#1E1E1E',
                    borderRadius: '16px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '15px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 'bold' }}>Eco Assistant</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {history.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#888', marginTop: '50%' }}>
                                <p>Ask "Is this safe for me?" or "Why is the score low?"</p>
                            </div>
                        )}
                        {history.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                maxWidth: '85%',
                                fontSize: '0.9rem',
                                color: 'white'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>AI is typing...</div>}
                        <div ref={bottomRef}></div>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Type a question..."
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '20px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white'
                            }}
                        />
                        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
