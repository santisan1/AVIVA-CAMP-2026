import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';

export default function RoleSelector() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl mb-6 shadow-2xl shadow-teal-500/20">
                        <span className="text-5xl">⛰️</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-3">AVIVA CAMP 2026</h1>
                    <p className="text-xl text-slate-600 font-semibold">¿Cómo deseas ingresar?</p>
                </div>

                {/* Opciones de Rol */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organizador */}
                    <button
                        onClick={() => navigate('/organizador')}
                        className="group bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-teal-500 transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Organizador</h2>
                                <p className="text-sm text-slate-600 font-semibold">
                                    Acceso completo al panel de control, gestión de acampantes, habitaciones y grupos
                                </p>
                            </div>
                            <div className="pt-4">
                                <span className="inline-flex items-center gap-2 text-teal-600 font-bold">
                                    Ingresar como organizador →
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* Acampante */}
                    <button
                        onClick={() => navigate('/acampante')}
                        className="group bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Acampante</h2>
                                <p className="text-sm text-slate-600 font-semibold">
                                    Accede a tu perfil personal, horarios, grupo pequeño y actividades del campamento
                                </p>
                            </div>
                            <div className="pt-4">
                                <span className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                                    Ingresar como acampante →
                                </span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500">
                        ¿Necesitas ayuda? Contacta a tu líder de grupo o a la organización
                    </p>
                </div>
            </div>
        </div>
    );
}