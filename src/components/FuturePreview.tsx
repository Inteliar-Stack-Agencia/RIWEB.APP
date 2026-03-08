import React from 'react';
import type { AuditFunctionResult, Locale } from '../types';

interface FuturePreviewProps {
    audit: AuditFunctionResult;
    locale: Locale;
}

export function FuturePreview({ audit, locale }: FuturePreviewProps) {
    const isSpanish = locale === 'es';

    return (
        <div className="future-preview-container" style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    {isSpanish ? "Tu Web en 2026" : "Your Web in 2026"}
                </h2>
                <p className="muted" style={{ fontSize: '1.2rem' }}>
                    {isSpanish
                        ? "Hemos proyectado tu negocio con nuestro stack de modernización e IA."
                        : "We have projected your business with our modernization and AI stack."}
                </p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Lado Izquierdo: Antes */}
                <div className="card" style={{ opacity: 0.6, borderStyle: 'dashed' }}>
                    <div style={{ padding: '0.5rem 1rem', background: '#f87171', color: 'white', borderRadius: '4px', display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '1rem' }}>
                        {isSpanish ? "SITUACIÓN ACTUAL" : "CURRENT STATUS"}
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>• Código legado propenso a errores</p>
                    <p style={{ fontSize: '0.9rem' }}>• Velocidad de carga lenta</p>
                    <p style={{ fontSize: '0.9rem' }}>• Sin captación automatizada</p>
                    <p style={{ fontSize: '0.9rem' }}>• Seguridad vulnerable</p>
                    <div style={{ marginTop: '1.5rem', height: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        [Legacy Layout]
                    </div>
                </div>

                {/* Lado Derecho: El Futuro */}
                <div className="card" style={{ border: '2px solid var(--color-cta)', background: 'linear-gradient(135deg, rgba(202,138,4,0.05), transparent)' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'var(--color-cta)', color: 'white', borderRadius: '4px', display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '1rem' }}>
                        {isSpanish ? "TRANSFORMACIÓN RIWEB" : "RIWEB TRANSFORMATION"}
                    </div>
                    <h4 style={{ color: 'var(--color-cta)', marginBottom: '1rem' }}>AI-Powered Engine 2026</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#34d399' }}>✓</span>
                            <span>{isSpanish ? "Arquitectura Next.js Ultra-Rápida" : "Ultra-Fast Next.js Arch"}</span>
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#34d399' }}>✓</span>
                            <span>{isSpanish ? "Asistente Proactivo de Ventas" : "Proactive Sales Assistant"}</span>
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#34d399' }}>✓</span>
                            <span>{isSpanish ? "Blindaje de Seguridad Total" : "Total Security Shield"}</span>
                        </li>
                    </ul>

                    <div style={{ marginTop: '1.5rem', position: 'relative', height: '150px', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem' }}>
                            <div style={{ width: '40%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }} />
                            <div style={{ width: '80%', height: '20px', background: 'var(--color-primary)', borderRadius: '4px', marginBottom: '15px' }} />
                            <div style={{ width: '90%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '5px' }} />
                            <div style={{ width: '70%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        </div>
                        {/* Mock Bot Premium (Stitch Style) */}
                        <div style={{
                            position: 'absolute',
                            bottom: '15px',
                            right: '15px',
                            width: '45px',
                            height: '45px',
                            background: 'black',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px var(--color-cta)',
                            border: '2px solid var(--color-cta)',
                            animation: 'pulseGhost 2s infinite'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>🤖</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button className="btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
                    {isSpanish ? "✦ Solicitar esta Modernización" : "✦ Request this Modernization"}
                </button>
            </div>
        </div>
    );
}
