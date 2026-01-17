import React, { useState, useEffect } from 'react';

import {
    getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc,
    serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { Home, MapPin, Users, Calendar, User, Phone, Bell, LogOut, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from "./firebase"; // ajustá la ruta
// Firebase Configuration (reemplazar con tus credenciales reales)
const firebaseConfig = {
    apiKey: "AIzaSyDfake-key-replace-with-real",
    authDomain: "aviva-camp.firebaseapp.com",
    projectId: "aviva-camp-2026",
    storageBucket: "aviva-camp.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};




// Componente de Login
const LoginScreen = ({ onLogin }) => {
    const [dni, setDni] = useState('');
    const [llave, setLlave] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Extraer DNI de la URL y autocompletar
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dniParam = params.get('dni');
        if (dniParam) {
            setDni(dniParam);
        }
    }, []);

    const handleLogin = async () => {
        if (!dni || !llave) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const acampanteRef = doc(db, 'acampantes', dni);
            const acampanteSnap = await getDoc(acampanteRef);

            if (!acampanteSnap.exists()) {
                setError('DNI no encontrado. Verifica tu número de documento.');
                setLoading(false);
                return;
            }

            const acampanteData = acampanteSnap.data();

            if (acampanteData.llave !== llave) {
                setError('Llave de acceso incorrecta. Intenta nuevamente.');
                setLoading(false);
                return;
            }

            localStorage.setItem('aviva_session', JSON.stringify({
                dni: dni,
                nombre: acampanteData.nombre,
                timestamp: Date.now()
            }));

            onLogin(dni);
        } catch (error) {
            console.error('Error en login:', error);
            setError('Error de conexión. Intenta nuevamente.');
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#008080] to-[#00A86B] rounded-3xl mb-4 shadow-2xl" style={{ boxShadow: '0 4px 20px -2px rgba(0, 128, 128, 0.3)' }}>
                        <span className="text-4xl">⛰️</span>
                    </div>
                    <h1 className="text-4xl font-black text-[#001B3D] mb-2">AVIVA CAMP 2026</h1>
                    <p className="text-slate-600 font-semibold">Bienvenido, Acampante</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl" style={{ boxShadow: '0 4px 20px -2px rgba(0, 27, 61, 0.05)' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-[#F0F9F9] rounded-2xl flex items-center justify-center border border-[#008080]/20">
                            <Lock className="w-6 h-6 text-[#008080]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#001B3D]">Ingreso Seguro</h2>
                            <p className="text-sm text-slate-500">Ingresa tus credenciales</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Número de DNI
                            </label>
                            <input
                                type="text"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="12345678"
                                className="w-full px-4 py-4 bg-[#F8FAFB] border border-slate-100 rounded-2xl text-[#001B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#008080] focus:bg-white font-bold text-lg transition-all"
                            />
                            {dni && (
                                <p className="text-xs text-[#00A86B] font-semibold mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    DNI detectado automáticamente
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Llave de Acceso Personal
                            </label>
                            <input
                                type="password"
                                value={llave}
                                onChange={(e) => setLlave(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tu llave secreta"
                                className="w-full px-4 py-4 bg-[#F8FAFB] border border-slate-100 rounded-2xl text-[#001B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#00A86B] focus:bg-white font-bold text-lg transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-semibold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#008080] to-[#00A86B] text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ boxShadow: '0 4px 20px -2px rgba(0, 128, 128, 0.3)' }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Ingresar al Campamento
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-xs text-blue-800 font-semibold text-center flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                ¿Olvidaste tu llave? Contacta a tu líder de grupo
                            </p>
                        </div>
                    </div>
                </div>

                {!dni && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            <strong>Tip:</strong> Si recibiste un link personalizado, úsalo para autocompletar tu DNI
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente Principal de Vista del Acampante
const AcampanteView = ({ dni, onLogout }) => {
    const [acampante, setAcampante] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [habitacion, setHabitacion] = useState(null);
    const [agendaHoy, setAgendaHoy] = useState([]);
    const [actividadActual, setActividadActual] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAcampanteData();
    }, [dni]);

    const loadAcampanteData = async () => {
        try {
            // 1. Cargar datos del acampante
            const acampanteRef = doc(db, 'acampantes', dni);
            const acampanteSnap = await getDoc(acampanteRef);

            if (!acampanteSnap.exists()) {
                console.error('Acampante no encontrado');
                return;
            }

            const acampanteData = { id: acampanteSnap.id, ...acampanteSnap.data() };
            setAcampante(acampanteData);

            // 2. Cargar grupo pequeño
            if (acampanteData.grupo) {
                const grupoRef = doc(db, 'grupos_pequenos', acampanteData.grupo);
                const grupoSnap = await getDoc(grupoRef);
                if (grupoSnap.exists()) {
                    setGrupo({ id: grupoSnap.id, ...grupoSnap.data() });
                }
            }

            // 3. Cargar habitación
            if (acampanteData.habitacion) {
                const habitacionesQuery = query(
                    collection(db, 'habitaciones'),
                    where('numero', '==', acampanteData.habitacion)
                );
                const habitacionSnap = await getDocs(habitacionesQuery);
                if (!habitacionSnap.empty) {
                    const habitacionData = habitacionSnap.docs[0].data();
                    setHabitacion(habitacionData);
                }
            }

            // 4. Cargar agenda del día
            const agendaSimulada = [
                { hora: '08:00', titulo: 'Desayuno', ubicacion: 'Comedor Central', icon: '🍳', duracion: 60 },
                { hora: '09:30', titulo: 'Alabanza Matutina', ubicacion: 'Auditorio', icon: '🎵', duracion: 90 },
                { hora: '11:00', titulo: acampanteData.taller || 'Taller Asignado', ubicacion: 'Zona de Talleres', icon: '📚', duracion: 120 },
                { hora: '13:30', titulo: 'Almuerzo General', ubicacion: 'Comedor Central', icon: '🍽️', duracion: 90 },
                { hora: '15:00', titulo: 'Carrera de Kayaks', ubicacion: 'Muelle del Lago', icon: '🚣', duracion: 90 },
                { hora: '17:30', titulo: 'Tiempo Libre / Siesta', ubicacion: 'Cabañas', icon: '🏕️', duracion: 120 },
                { hora: '20:00', titulo: 'Reunión General', ubicacion: 'Auditorio', icon: '🎤', duracion: 120 }
            ];

            setAgendaHoy(agendaSimulada);

            // Determinar actividad actual
            const ahora = new Date();
            const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

            for (let actividad of agendaSimulada) {
                const [h, m] = actividad.hora.split(':').map(Number);
                const minutos = h * 60 + m;
                const minutosFin = minutos + actividad.duracion;

                if (horaActual >= minutos && horaActual < minutosFin) {
                    const progreso = ((horaActual - minutos) / actividad.duracion) * 100;
                    const faltanMinutos = minutosFin - horaActual;
                    setActividadActual({ ...actividad, progreso, faltanMinutos });
                    break;
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-[#008080] animate-spin mx-auto mb-4" />
                    <p className="text-slate-700 font-bold text-lg">Estamos cargando, hola {acampante.nombre.split(' ')[0]}!</p>
                </div>t
            </div>
        );
    }

    if (!acampante) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-white font-bold text-lg">Error al cargar datos</p>
                    <button
                        onClick={onLogout}
                        className="mt-4 px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32 relative overflow-x-hidden">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/95 backdrop-blur-md z-30">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${acampante.presente
                                ? 'bg-[#E6F6F0] text-[#00A86B] border border-[#D1EFDE]'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                <span className={`flex h-1.5 w-1.5 rounded-full ${acampante.presente ? 'bg-[#00A86B]' : 'bg-slate-400'}`}></span>
                                {acampante.presente ? 'PRESENTE' : 'PENDIENTE'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#001B3D]">
                            ¡Hola, {acampante.nombre.split(' ')[0]}!
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-[#001B3D] border border-slate-100 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#008080] rounded-full border-2 border-white"></span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-[#001B3D] border border-slate-100 hover:bg-slate-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-5 space-y-6">
                {/* Tu Estado */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-1">Tu Estado</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Ubicación */}
                        <div className="bg-[#F8FAFB] p-4 rounded-2xl flex flex-col aspect-square justify-between border border-slate-100">
                            <MapPin className="w-6 h-6 text-[#001B3D]" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Ubicación</p>
                                <p className="text-lg font-bold text-[#001B3D]">
                                    {habitacion ? `${habitacion.tipo} ${habitacion.numero}` : acampante.habitacion || 'Sin asignar'}
                                </p>
                                {habitacion && (
                                    <p className="text-xs text-slate-500 mt-1">Piso {habitacion.piso}</p>
                                )}
                            </div>
                        </div>

                        {/* Equipo (con color del grupo) */}
                        <div
                            className="p-4 rounded-2xl flex flex-col aspect-square justify-between text-white shadow-lg"
                            style={{
                                backgroundColor: grupo?.color || '#008080',
                                boxShadow: '0 4px 20px -2px rgba(0, 128, 128, 0.1)'
                            }}
                        >
                            <Users className="w-6 h-6 text-white" style={{ fill: 'currentColor' }} />
                            <div>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-tighter">Equipo</p>
                                <p className="text-lg font-extrabold leading-tight">
                                    {grupo?.nombre || 'Sin grupo'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actividad En Curso */}
                {actividadActual && (
                    <section>
                        <div className="bg-white p-5 rounded-3xl border-2 border-[#008080]/20 relative overflow-hidden" style={{ boxShadow: '0 4px 20px -2px rgba(0, 27, 61, 0.05)' }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black text-[#008080] uppercase tracking-widest">En Curso</span>
                                    <h3 className="text-xl font-extrabold text-[#001B3D]">{actividadActual.titulo}</h3>
                                    <p className="text-slate-500 text-sm flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {actividadActual.ubicacion}
                                    </p>
                                </div>
                                <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase text-center leading-none mb-0.5">Faltan</p>
                                    <p className="text-sm font-black text-[#008080] text-center">{actividadActual.faltanMinutos}m</p>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#008080] rounded-full transition-all"
                                    style={{ width: `${actividadActual.progreso}%` }}
                                ></div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Próximamente */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Próximamente</h2>
                        <span className="text-[10px] font-bold text-slate-400">Hoy</span>
                    </div>
                    <div className="space-y-2">
                        {agendaHoy.slice(0, 3).map((actividad, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100" style={{ boxShadow: '0 4px 20px -2px rgba(0, 27, 61, 0.05)' }}>
                                <div className="w-10 h-10 rounded-xl bg-[#F0F9F9] flex items-center justify-center text-[#008080]">
                                    <span className="text-2xl">{actividad.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#001B3D]">{actividad.titulo}</p>
                                    <p className="text-[11px] text-slate-500">{actividad.ubicacion}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400">{actividad.hora}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Aviso de Dieta (si aplica) */}
                {acampante.dieta && acampante.dieta !== 'Ninguna' && (
                    <section>
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Recordatorio de Dieta</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Tu dieta registrada: <span className="font-bold">{acampante.dieta}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Botón flotante de WhatsApp (si hay líder) */}
            {grupo?.telefono_lider && (
                <div className="fixed bottom-28 right-6 z-50">
                    <a
                        href={`https://wa.me/${grupo.telefono_lider.replace(/\D/g, '')}?text=Hola, soy ${acampante.nombre} del ${grupo.nombre}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg active:scale-95 transition-transform"
                    >
                        <Phone className="w-7 h-7" />
                    </a>
                </div>
            )}

            {/* Navegación inferior */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pt-4 pb-8 flex justify-between items-center z-40">
                <button className="flex flex-col items-center gap-1 text-[#00A86B] bg-[#E6F6F0] border-[1.5px] border-[#00A86B] rounded-xl px-3 py-1">
                    <Home className="w-6 h-6" style={{ fill: 'currentColor' }} />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Panel</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#001B3D]/60 px-3 hover:text-[#001B3D] transition-colors">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Agenda</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#001B3D]/60 px-3 hover:text-[#001B3D] transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Grupo</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#001B3D]/60 px-3 hover:text-[#001B3D] transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Perfil</span>
                </button>
            </nav>
        </div>
    );
};

// App Principal con manejo de sesión
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userDni, setUserDni] = useState(null);

    // Verificar sesión al cargar
    useEffect(() => {
        const session = localStorage.getItem('aviva_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                // Verificar si la sesión tiene menos de 7 días
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                if (sessionData.timestamp > weekAgo) {
                    setUserDni(sessionData.dni);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('aviva_session');
                }
            } catch (error) {
                localStorage.removeItem('aviva_session');
            }
        }
    }, []);

    const handleLogin = (dni) => {
        setUserDni(dni);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('aviva_session');
        setUserDni(null);
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return <AcampanteView dni={userDni} onLogout={handleLogout} />;
}