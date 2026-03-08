import React, { useState } from 'react';
import type { AuditFunctionResult, Locale } from '../types';
import { CATALOG, Product } from '../lib/catalog';
import { AIAssistantWidget } from './AIAssistantWidget';
import { InteractiveTooltip } from './InteractiveTooltip';

interface FuturePreviewProps {
    audit: AuditFunctionResult;
    report: any;
    locale: Locale;
}

type Tab = 'help' | 'store' | 'dashboard' | 'assistant';

export function FuturePreview({ audit, report, locale }: FuturePreviewProps) {
    const isSpanish = locale === 'es';
    const [activeTab, setActiveTab] = useState<Tab>('help');
    const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', address: '' });
    const [purchaseDone, setPurchaseDone] = useState(false);

    const mockup = report?.mockup || {
        headline: isSpanish ? "Tu Web en 2026" : "Your Web in 2026",
        bot_intro: isSpanish
            ? "Hola, soy tu RI-Agent. He analizado tu sitio y puedo automatizar tus ventas hoy mismo."
            : "Hi, I'm your RI-Agent. I've analyzed your site and can automate your sales today.",
        recommended_accent: '#ca8a04'
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { product, qty: 1 }];
        });
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

    const handleAutofill = () => {
        setCheckoutForm({
            name: "Oscar RIWEB",
            email: "oscar@test.com",
            address: "Av. Modernización 2026, CABA"
        });
    };

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        setPurchaseDone(true);
        setTimeout(() => {
            setIsCheckoutOpen(false);
            setCart([]);
            setPurchaseDone(false);
        }, 3000);
    };

    return (
        <div className="future-preview-container" style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--glass-border)', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ padding: '0.4rem 1rem', background: 'rgba(202, 138, 4, 0.1)', color: 'var(--color-cta)', borderRadius: '99px', display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '1rem', border: '1px solid var(--color-cta)' }}>
                    {isSpanish ? "VISTA PREVIA ESTRATÉGICA" : "STRATEGIC PREVIEW"}
                </div>
                <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem', lineHeight: 1.1 }}>
                    {mockup.headline}
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    {(['help', 'store', 'dashboard', 'assistant'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '12px',
                                background: activeTab === tab ? 'var(--color-cta)' : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab ? 'white' : 'var(--text-muted)',
                                border: '1px solid ' + (activeTab === tab ? 'var(--color-cta)' : 'rgba(255,255,255,0.1)'),
                                cursor: 'pointer', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem'
                            }}
                        >
                            {isSpanish
                                ? (tab === 'help' ? '❓ Guía' : tab === 'store' ? '🛒 Tienda' : tab === 'dashboard' ? '📊 Dashboard' : '🤖 Asistente')
                                : (tab === 'help' ? '❓ Guide' : tab === 'store' ? '🛒 Shop' : tab === 'dashboard' ? '📊 Dashboard' : '🤖 Assistant')}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'help' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛍️</div>
                        <h4 style={{ color: 'var(--color-cta)' }}>{isSpanish ? "La Tienda" : "The Shop"}</h4>
                        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {isSpanish
                                ? "Es tu vidriera digital moderna. Aquí los clientes ven tus fotos HD que cargan rapidísimo para que no se aburran y se vayan."
                                : "It's your modern digital storefront. Here customers see HD photos that load super fast so they don't get bored and leave."}
                        </p>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
                        <h4 style={{ color: 'var(--color-cta)' }}>{isSpanish ? "Autocompletar con IA" : "AI Autofill"}</h4>
                        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {isSpanish
                                ? "Un 'secretario mágico' que llena los datos de la persona por ella. ¡Ideal para que compren rápido sin tener que escribir tanto!"
                                : "A 'magic secretary' that fills out the person's info for them. Perfect for fast shopping without typing much!"}
                        </p>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                        <h4 style={{ color: 'var(--color-cta)' }}>{isSpanish ? "El Dashboard" : "The Dashboard"}</h4>
                        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {isSpanish
                                ? "Un dibujo fácil de entender que te dice cuánta gente más entró a tu web y cuánto tiempo te ahorraste gracias a los robots."
                                : "An easy-to-understand chart that tells you how many more people came to your site and how much time you saved thanks to robots."}
                        </p>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
                        <h4 style={{ color: 'var(--color-cta)' }}>{isSpanish ? "El Asistente" : "The Assistant"}</h4>
                        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                            {isSpanish
                                ? "Un robotito inteligente que atiende las dudas de tus clientes incluso cuando vos estás durmiendo o descansando."
                                : "A smart robot that answers customer questions even when you are sleeping or resting."}
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'store' && (
                <div>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                        {CATALOG.map((product, i) => (
                            <div key={product.id} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                <img src={product.image} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h5 style={{ margin: 0, fontSize: '1rem' }}>{isSpanish ? product.name_es : product.name_en}</h5>
                                    <span style={{ fontWeight: 700, color: 'var(--color-cta)' }}>${product.price}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    {product.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>{tag}</span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', fontSize: '0.85rem' }}
                                >
                                    {i === 0 ? (
                                        <InteractiveTooltip text={isSpanish ? "Añadí productos para ver la potencia del carrito optimizado." : "Add products to see the power of the optimized cart."}>
                                            {isSpanish ? "Añadir al Carrito" : "Add to Cart"}
                                        </InteractiveTooltip>
                                    ) : (isSpanish ? "Añadir al Carrito" : "Add to Cart")}
                                </button>
                            </div>
                        ))}
                    </div>

                    {cart.length > 0 && (
                        <div style={{
                            position: 'sticky', bottom: '20px', background: 'var(--color-cta)',
                            color: 'white', padding: '1rem 2rem', borderRadius: '16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginTop: '2rem', zIndex: 100
                        }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total: ${cartTotal}</span>
                                <span style={{ marginLeft: '1rem', opacity: 0.8 }}>{cart.length} items</span>
                            </div>
                            <button onClick={() => setIsCheckoutOpen(true)} className="btn-white" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                                {isSpanish ? "Finalizar Compra ➜" : "Checkout ➜"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'dashboard' && (
                <div className="grid">
                    <div className="card">
                        <h4 style={{ color: 'var(--color-cta)' }}>{isSpanish ? "Crecimiento de Conversión" : "Conversion Growth"}</h4>
                        <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '1rem 0' }}>
                            {[30, 45, 40, 65, 85, 95].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--color-cta)', borderRadius: '4px', opacity: 0.3 + (i * 0.15) }} />
                            ))}
                        </div>
                        <p className="muted" style={{ fontSize: '0.85rem' }}>{isSpanish ? "Incremento proyectado del 210% en captación de leads." : "Projected 210% increase in lead acquisition."}</p>
                    </div>
                    <div className="card">
                        <h4 style={{ color: '#10b981' }}>{isSpanish ? "Velocidad de Respuesta" : "Response Speed"}</h4>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981' }}>- 85%</div>
                            <p className="muted">{isSpanish ? "Tiempo de respuesta reducido mediante Agentes IA" : "Response time reduced via AI Agents"}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'assistant' && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                    <h3>{isSpanish ? "El Asistente está Activo" : "The Assistant is Active"}</h3>
                    <p className="muted">{isSpanish ? "Abrí el widget flotante en la esquina inferior derecha para chatear con la IA." : "Open the floating widget in the bottom right corner to chat with the AI."}</p>
                </div>
            )}

            {isCheckoutOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--color-cta)' }}>
                        {purchaseDone ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                                <h2>{isSpanish ? "¡Pedido Realizado!" : "Order Placed!"}</h2>
                                <p className="muted">{isSpanish ? "Simulando la integración con tu sistema de gestión..." : "Simulating integration with your management system..."}</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ margin: 0 }}>{isSpanish ? "Finalizar Compra" : "Checkout"}</h3>
                                    <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
                                </div>
                                <form onSubmit={handlePurchase}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                        <button type="button" onClick={handleAutofill} style={{ background: 'rgba(202,138,4,0.1)', color: 'var(--color-cta)', border: '1px solid var(--color-cta)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <InteractiveTooltip text={isSpanish ? "Probá el autocompletado con IA para una experiencia friccion-cero." : "Try AI autofill for a zero-friction experience."}>
                                                ✨ {isSpanish ? "Autocompletar con IA" : "AI Autofill"}
                                            </InteractiveTooltip>
                                        </button>
                                    </div>
                                    <div style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                                        <input required placeholder={isSpanish ? "Nombre Completo" : "Full Name"} value={checkoutForm.name} onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })} />
                                        <input required type="email" placeholder="Email" value={checkoutForm.email} onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })} />
                                        <input required placeholder={isSpanish ? "Dirección de Entrega" : "Delivery Address"} value={checkoutForm.address} onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                                        {isSpanish ? "Confirmar Compra" : "Confirm Purchase"} - ${cartTotal}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <AIAssistantWidget locale={locale} auditUrl={audit.url} />

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button className="btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                    {isSpanish ? "✦ Solicitar esta Modernización" : "✦ Request this Modernization"}
                </button>
            </div>
        </div>
    );
}
