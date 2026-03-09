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

export function FuturePreview({ audit, report, locale }: FuturePreviewProps) {
    const isSpanish = locale === 'es';
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
        <div className="future-preview-container" style={{ marginTop: '4rem', padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid var(--glass-border)', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ padding: '0.4rem 1.5rem', background: 'linear-gradient(90deg, rgba(248, 113, 113, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%)', color: 'white', borderRadius: '99px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {isSpanish ? "EVOLUCIÓN DIGITAL 2026" : "2026 DIGITAL EVOLUTION"}
                </div>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1, fontWeight: 800 }}>
                    {isSpanish ? "De Supervivencia a Liderazgo" : "From Survival to Leadership"}
                </h2>
                <p className="muted" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}>
                    {isSpanish
                        ? "Compará cómo rinde una web tradicional frente al potencial de la modernización con IA de RiWeb."
                        : "Compare how a traditional web performs against the potential of RiWeb's AI modernization."}
                </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
                {/* --- LEGACY SIDE (Vidriería Florida) --- */}
                <div className="card legacy-view" style={{ padding: '2rem', background: 'rgba(248, 113, 113, 0.03)', border: '1px dashed rgba(248, 113, 113, 0.3)', position: 'relative', opacity: 0.8 }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', padding: '2px 10px', background: '#f87171', color: 'white', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                        {isSpanish ? "WEB TRADICIONAL (VIDRIERÍA FLORIDA)" : "TRADITIONAL WEB (VIDRIERÍA FLORIDA)"}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>🔴 {isSpanish ? "Información Estática" : "Static Information"}</div>
                        <p className="muted" style={{ fontSize: '0.9rem' }}>{isSpanish ? "Catálogo que no vende. El cliente debe llamar o ir al local para saber precios." : "Catalog that doesn't sell. Customer must call or visit the shop for prices."}</p>
                    </div>

                    <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(248,113,113,0.1)', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{isSpanish ? "MÉTODO DE CONTACTO" : "CONTACT METHOD"}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📞 {isSpanish ? "Llamar a Galería Embassy" : "Call Embassy Gallery"}</div>
                    </div>

                    <div style={{ padding: '1.5rem', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '12px', textAlign: 'center', background: 'rgba(248, 113, 113, 0.05)' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📉</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{isSpanish ? "Fuga de Clientes 40%" : "40% Customer Leakage"}</div>
                        <p className="muted" style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>{isSpanish ? "Muchos ven los productos pero se van sin consultar por falta de respuesta inmediata." : "Many see products but leave without asking due to lack of immediate response."}</p>
                    </div>
                </div>

                {/* --- MODERN 2026 SIDE (RiWeb Modernized) --- */}
                <div className="card modern-2026-view" style={{ padding: '2rem', background: 'rgba(202, 138, 4, 0.05)', border: '2px solid var(--color-cta)', position: 'relative', boxShadow: '0 0 40px rgba(202, 138, 4, 0.15)' }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', padding: '2px 10px', background: 'var(--color-cta)', color: 'white', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                        {isSpanish ? "WEB MODERNIZADA 2026 (RIWEB)" : "2026 MODERNIZED WEB (RIWEB)"}
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-cta)', marginBottom: '0.5rem' }}>✨ {isSpanish ? "Cotización IA al Instante" : "Instant AI Quote"}</div>
                        <p className="muted" style={{ fontSize: '0.9rem' }}>{isSpanish ? "Tus clientes compran vidrios y espejos a medida con presupuesto automático y cierre por WhatsApp." : "Your customers buy tailor-made glass and mirrors with automatic quotes and WhatsApp closing."}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '2rem' }}>
                        {[
                            { id: 'v1', n_es: 'Espejo Biselado', n_en: 'Beveled Mirror', p: 8500, img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400' },
                            { id: 'v2', n_es: 'Mampara Glass', n_en: 'Glass Partition', p: 45000, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400' }
                        ].map((product) => (
                            <div key={product.id} className="card" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src={product.img} alt="" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.4rem' }} />
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.2rem' }}>{isSpanish ? product.n_es : product.n_en}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-cta)', fontWeight: 800, marginBottom: '0.3rem' }}>${product.p}</div>
                                <button
                                    onClick={() => alert(isSpanish ? "¡Un agente IA está procesando tu pedido de Vidrio!" : "An AI agent is processing your Glass order!")}
                                    style={{ background: 'var(--color-cta)', border: 'none', color: 'white', borderRadius: '4px', width: '100%', padding: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                    {isSpanish ? "Solicitar Cotización" : "Get Quote"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid" style={{ gap: '1rem' }}>
                        <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>- 90%</div>
                            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{isSpanish ? "Tiempo de Venta" : "Sales Time"}</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(202, 138, 4, 0.08)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(202, 138, 4, 0.2)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-cta)' }}>+ 300%</div>
                            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{isSpanish ? "Conversión 24/7" : "24/7 Conversion"}</div>
                        </div>
                    </div>
                </div>
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
                        {isSpanish ? "Ver Carrito ➜" : "View Cart ➜"}
                    </button>
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
                                            ✨ {isSpanish ? "Autocompletar con IA" : "AI Autofill"}
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

            <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                <button
                    className="btn-primary"
                    style={{ padding: '1.5rem 4rem', fontSize: '1.4rem', boxShadow: '0 0 30px rgba(202, 138, 4, 0.4)', borderRadius: '99px' }}
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                    {isSpanish ? "✦ Quiero mi Web 2026 Ahora" : "✦ I Want my 2026 Web Now"}
                </button>
                <p className="muted" style={{ marginTop: '1.5rem' }}>
                    {isSpanish ? "Plan estratégico bonificado por tiempo limitado." : "Complimentary strategic plan for a limited time."}
                </p>
            </div>
        </div>
    );
}
