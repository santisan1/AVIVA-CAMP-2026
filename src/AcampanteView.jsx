import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Home, MapPin, Users, Calendar, Phone, Bell, LogOut, Lock, Loader2, AlertCircle } from 'lucide-react';

// Firebase Configuration (reemplazar con tus credenciales reales)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Componente de Login
const LoginScreen = ({ onLogin }) => {
    const [dni, setDni] = useState('');
    const [llave, setLlave] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Extraer DNI de la URL si existe
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
            // Buscar acampante por DNI
            const acampanteRef = doc(db, 'acampantes', dni);
            const acampanteSnap = await getDoc(acampanteRef);

            if (!acampanteSnap.exists()) {
                setError('DNI no encontrado. Verifica tu número de documento.');
                setLoading(false);
                return;
            }

            const acampanteData = acampanteSnap.data();

            // Validar llave
            if (acampanteData.llave !== llave) {
                setError('Llave de acceso incorrecta. Intenta nuevamente.');
                setLoading(false);
                return;
            }

            // Guardar sesión
            localStorage.setItem('aviva_session', JSON.stringify({
                dni: dni,
                nombre: acampanteData.nombre,
                timestamp: Date.now()
            }));

            // Login exitoso
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
        <div className="min-h-screen bg-whiteflex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo y Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl mb-4 shadow-2xl shadow-orange-500/20">
                        <span className="text-4xl">⛰️</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2">AVIVA CAMP 2026</h1>
                    <p className="text-slate-600 font-semibold">Acceso Seguro de Acampante</p>
                </div>

                {/* Card de Login */}
                <div className="bg-teal-50 rounded-3xl p-8 border border-slate-200 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12  bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Lock className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Ingreso</h2>
                            <p className="text-sm text-slate-700">Ingresa tus credenciales</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* DNI Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Número de DNI
                            </label>
                            <input
                                type="text"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="12345678"
                                className="w-full px-4 py-4  bg-slate-100 border-2 border-slate-300 rounded-2xl text-slate-900 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 font-bold text-lg"
                            />
                        </div>

                        {/* Llave Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                Llave de Acceso
                            </label>
                            <input
                                type="password"
                                value={llave}
                                onChange={(e) => setLlave(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tu llave personal"
                                className="w-full px-4 py-4  bg-slate-100 border-2 border-slate-300 rounded-2xl text-slate-900 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 font-bold text-lg"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-400 font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-900 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                'Ingresar al Campamento'
                            )}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-700 text-center">
                            ¿Problemas para acceder? Contacta a tu líder de grupo
                        </p>
                    </div>
                </div>
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
            <div className="min-h-screen bg-whiteflex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-900 font-bold text-lg">Cargando tu información...</p>
                </div>
            </div>
        );
    }

    if (!acampante) {
        return (
            <div className="min-h-screen bg-whiteflex items-center justify-center p-6">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-slate-900 font-bold text-lg">Error al cargar datos</p>
                    <button
                        onClick={onLogout}
                        className="mt-4 px-6 py-3  bg-slate-100 text-slate-900 rounded-xl font-bold"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-whitepb-32">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${acampante.presente
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : ' bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                <span className={`flex h-1.5 w-1.5 rounded-full ${acampante.presente ? 'bg-green-400' : 'bg-zinc-500'}`}></span>
                                {acampante.presente ? 'PRESENTE' : 'PENDIENTE'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            ¡Hola, {acampante.nombre.split(' ')[0]}!
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-slate-900 border border-slate-200 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 from-teal-500 rounded-full border-2 border-black"></span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-slate-900 border border-slate-200 hover: bg-slate-100 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-5 space-y-6">
                {/* Tu Estado */}
                <section>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 mb-3 px-1">Tu Estado</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Ubicación */}
                        <div className="bg-teal-50 p-4 rounded-2xl flex flex-col aspect-square justify-between border border-slate-200">
                            <MapPin className="w-6 h-6 text-slate-900" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-700 uppercase">Ubicación</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {habitacion ? `${habitacion.tipo} ${habitacion.numero}` : acampante.habitacion || 'Sin asignar'}
                                </p>
                                {habitacion && (
                                    <p className="text-xs text-slate-700 mt-1">Piso {habitacion.piso}</p>
                                )}
                            </div>
                        </div>

                        {/* Equipo (con color del grupo) */}
                        <div
                            className="p-4 rounded-2xl flex flex-col aspect-square justify-between text-slate-900 shadow-lg"
                            style={{ backgroundColor: grupo?.color || '#f97316' }}
                        >
                            <Users className="w-6 h-6 text-slate-900" style={{ fill: 'currentColor' }} />
                            <div>
                                <p className="text-[10px] font-black text-slate-900/70 uppercase tracking-tighter">Equipo</p>
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
                        <div className="bg-teal-50 p-5 rounded-3xl border-2 border-orange-500/20 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">En Curso</span>
                                    <h3 className="text-xl font-extrabold text-slate-900">{actividadActual.titulo}</h3>
                                    <p className="text-slate-600 text-sm flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {actividadActual.ubicacion}
                                    </p>
                                </div>
                                <div className=" bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300">
                                    <p className="text-[10px] font-bold text-slate-600 uppercase text-center leading-none mb-0.5">Faltan</p>
                                    <p className="text-sm font-black text-orange-500 text-center">{actividadActual.faltanMinutos}m</p>
                                </div>
                            </div>
                            <div className="w-full  bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full from-teal-500 rounded-full transition-all"
                                    style={{ width: `${actividadActual.progreso}%` }}
                                ></div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Próximamente */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Próximamente</h2>
                        <span className="text-[10px] font-bold text-slate-700">Hoy</span>
                    </div>
                    <div className="space-y-2">
                        {agendaHoy.slice(0, 3).map((actividad, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl border border-slate-200">
                                <div className="w-10 h-10 rounded-xl  bg-slate-100 flex items-center justify-center text-2xl">
                                    {actividad.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{actividad.titulo}</p>
                                    <p className="text-[11px] text-slate-700">{actividad.ubicacion}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-600">{actividad.hora}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Aviso de Dieta (si aplica) */}
                {acampante.dieta && acampante.dieta !== 'Ninguna' && (
                    <section>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-blue-400">Recordatorio de Dieta</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Tu dieta registrada: <span className="font-bold text-slate-900">{acampante.dieta}</span>
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
                        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-slate-900 rounded-full shadow-2xl shadow-green-500/20 hover:scale-110 transition-transform"
                    >
                        <Phone className="w-7 h-7" />
                    </a>
                </div>
            )}

            {/* Navegación inferior */}
            <nav className="fixed bottom-0 left-0 right-0 bg-teal-50/95 backdrop-blur-xl border-t border-slate-200 px-6 pt-4 pb-8 flex justify-between items-center z-40">
                <button className="flex flex-col items-center gap-1 text-orange-500 from-teal-500/10 border border-orange-500/20 rounded-2xl px-4 py-2">
                    <Home className="w-6 h-6" style={{ fill: 'currentColor' }} />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Panel</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-700 px-3 hover:text-zinc-300 transition-colors">
                    <Calendar className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Agenda</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-700 px-3 hover:text-zinc-300 transition-colors">
                    <Users className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Grupo</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-700 px-3 hover:text-zinc-300 transition-colors">
                    <MapPin className="w-6 h-6" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">Mapa</span>
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