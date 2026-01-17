import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import AvivaApp from './AvivaApp';
import { Link } from "react-router-dom";

// CÓDIGO DE ACCESO HARDCODEADO (cambiar en producción)
const CODIGO_ORGANIZADOR = "AVIVA2026";

export default function OrganizadorAuth() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si ya hay una sesión activa
    useEffect(() => {
        const session = localStorage.getItem('aviva_organizador_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                // Sesión válida por 24 horas
                const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
                if (sessionData.timestamp > dayAgo) {
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('aviva_organizador_session');
                }
            } catch (error) {
                localStorage.removeItem('aviva_organizador_session');
            }
        }
    }, []);

    const handleLogin = () => {
        if (!codigo.trim()) {
            setError('Por favor ingresa el código de acceso');
            return;
        }

        setLoading(true);
        setError('');

        // Simular delay de verificación
        setTimeout(() => {
            if (codigo.toUpperCase().trim() === CODIGO_ORGANIZADOR) {
                // Guardar sesión
                localStorage.setItem('aviva_organizador_session', JSON.stringify({
                    role: 'organizador',
                    timestamp: Date.now()
                }));
                setIsAuthenticated(true);
            } else {
                setError('Código de acceso incorrecto. Intenta nuevamente.');
                setLoading(false);
            }
        }, 800);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('aviva_organizador_session');
        setIsAuthenticated(false);
        setCodigo('');
    };

    // Si está autenticado, mostrar la app del organizador
    if (isAuthenticated) {
        return (
            <div className="relative">
                <AvivaApp />
                {/* Botón de logout flotante */}
                <button
                    onClick={handleLogout}
                    className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 text-sm"
                >
                    <Lock className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    // Pantalla de login
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo y Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#008080] to-[#00A86B] rounded-3xl mb-4 shadow-2xl shadow-teal-500/30">
                        <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Panel de Organizadores</h1>
                    <p className="text-slate-600 font-semibold">Acceso Restringido</p>
                </div>

                {/* Card de Login */}
                <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center border-2 border-[#008080]">
                            <Lock className="w-6 h-6 text-[#008080]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Verificación de Seguridad</h2>
                            <p className="text-sm text-slate-600">Solo personal autorizado</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Código Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Código de Acceso de Organizador
                            </label>
                            <input
                                type="password"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ingresa el código maestro"
                                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#008080] focus:bg-white font-bold text-lg transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#008080] to-[#00A86B] text-white rounded-2xl font-black text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Acceder al Panel
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t-2 border-slate-100">
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                            <p className="text-xs text-amber-800 font-semibold text-center flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" />
                                Solo personal del campamento puede acceder
                            </p>
                        </div>
                    </div>

                    {/* Código de prueba visible (SOLO PARA DESARROLLO) */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-400">
                            <strong>Desarrollo:</strong> Código = <code className="bg-slate-100 px-2 py-1 rounded">AVIVA2026</code>
                        </p>
                    </div>
                </div>

                {/* Volver */}
                <div className="mt-6 text-center">
                    <Link
                        to="https://aviva-camp-2026.vercel.app/"
                        className="text-sm text-slate-600 hover:text-slate-900 font-semibold"
                    >
                        ← Volver al selector de roles
                    </Link>
                </div>
            </div>
        </div>
    );
}