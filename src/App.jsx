import React, { useState, useEffect } from 'react';
import { initializeApp, db } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  Home, QrCode, Building2, Search, Calendar, User, Phone, AlertCircle,
  Clock, Users, UserCheck, UserX, Package, Award, X, Bell, CheckCircle,
  RefreshCw, Download, AlertTriangle, Menu,
  Plus, ChevronLeft, ChevronRight  // <-- Añade estos
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5Qrcode } from 'html5-qrcode';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwgJfdmLIYklZULlyx1VMeJW7ul_Nmcrs",
  authDomain: "aviva-camp-2026.firebaseapp.com",
  projectId: "aviva-camp-2026",
  storageBucket: "aviva-camp-2026.firebasestorage.app",
  messagingSenderId: "564202054034",
  appId: "1:564202054034:web:5c7584214c1e1276b5214b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, color: 'text-emerald-700' },
    error: { bg: 'bg-red-50 border-red-200', icon: AlertTriangle, color: 'text-red-700' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: Bell, color: 'text-blue-700' }
  };

  const { bg, icon: Icon, color } = config[type] || config.info;

  return (
    <div className={`fixed top-6 right-6 z-50 border rounded-2xl p-4 ${bg} shadow-2xl max-w-sm animate-slideIn`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
        <div className="flex-1">
          <p className={`font-bold text-sm ${color}`}>
            {type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : 'Información'}
          </p>
          <p className={`text-xs mt-1 ${color}`}>{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const QRScanner = ({ onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Verificar si ya tenemos permisos
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Intentar acceder a la cámara para ver si ya tenemos permisos
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      } catch (err) {
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, []);

  const requestCameraPermission = async () => {
    try {
      setCameraError(null);

      // Solicitar permiso de cámara explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Detener el stream inmediatamente (solo queríamos el permiso)
      stream.getTracks().forEach(track => track.stop());

      setHasPermission(true);
      startScanner();

    } catch (error) {
      console.error('Error al solicitar cámara:', error);
      setCameraError(getCameraErrorMessage(error));
      setHasPermission(false);
    }
  };

  const getCameraErrorMessage = (error) => {
    if (error.name === 'NotAllowedError') {
      return 'Permiso de cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.';
    } else if (error.name === 'NotFoundError') {
      return 'No se encontró ninguna cámara. Asegúrate de tener una cámara conectada.';
    } else if (error.name === 'NotSupportedError') {
      return 'Tu navegador no soporta acceso a la cámara. Intenta con Chrome o Firefox.';
    } else if (error.name === 'NotReadableError') {
      return 'La cámara está siendo usada por otra aplicación.';
    }
    return `Error de cámara: ${error.message}`;
  };

  // Importante: Asegúrate de importar Html5Qrcode (sin el "Scanner" al final)


  // ... dentro del componente ...

  const startScanner = async () => {
    if (isScanning) return;

    // 1. Instanciamos la versión "Manual" (Html5Qrcode)
    // Esto no agrega botones automáticos, solo el video
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);

    const qrConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    try {
      // 2. Iniciamos la cámara directamente
      await html5QrCode.start(
        { facingMode: "environment" }, // Cámara trasera
        qrConfig,
        (decodedText) => {
          console.log('QR detectado:', decodedText);
          onScanSuccess(decodedText);
          // Opcional: Detener tras éxito
          // stopScanner(); 
        },
        (errorMessage) => {
          // Errores de escaneo constantes (ignorar)
        }
      );

      setIsScanning(true);
      setCameraError(null);
    } catch (error) {
      console.error('Error al iniciar cámara:', error);
      setCameraError(getCameraErrorMessage(error));
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
        // Después de stop(), el div "reader" queda limpio
        setScanner(null);
        setIsScanning(false);
      } catch (error) {
        console.error('Error al detener scanner:', error);
      }
    }
  };



  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (scanner) {
        stopScanner();
      }
    };
  }, [scanner]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Escanear QR</h2>
        <p className="text-slate-600 font-semibold">Escanea el DNI del participante</p>
      </div>

      {/* Mensaje de error */}
      {cameraError && (
        <div className="w-full max-w-md bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Error de cámara</p>
              <p className="text-xs text-red-700 mt-1">{cameraError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Elemento donde se renderiza el scanner - DEBE ESTAR SIEMPRE VISIBLE */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-emerald-500 bg-black shadow-2xl min-h-[400px]">

        {/* El div "reader" SIEMPRE debe estar primero y visible si isScanning es true */}
        <div
          id="reader"
          className={`w-full h-full ${!isScanning ? 'hidden' : 'block'}`}
        ></div>

        {isScanning ? (
          <>
            {/* Tus guías visuales (línea animada, esquinas, etc) */}
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan z-10"></div>
            {/* ... resto de tus guías ... */}
          </>
        ) : (
          /* Pantalla de inicio - Solo se ve cuando NO estamos escaneando */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black z-20">
            {/* ... tus instrucciones y el icono de QR ... */}
          </div>
        )}
      </div>

      {/* Controles del scanner */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        {!isScanning ? (
          <>
            {!hasPermission ? (
              <button
                onClick={requestCameraPermission}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
              >
                <AlertCircle className="w-6 h-6" />
                <span>Solicitar Permiso de Cámara</span>
              </button>
            ) : (
              <button
                onClick={startScanner}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
              >
                <QrCode className="w-6 h-6" />
                <span>Iniciar Cámara</span>
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={stopScanner}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-3"
            >
              <X className="w-6 h-6" />
              <span>Detener Cámara</span>
            </button>

            <button
              onClick={() => {
                stopScanner();
                setTimeout(startScanner, 500);
              }}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-6 h-6" />
              <span>Reiniciar</span>
            </button>
          </>
        )}
      </div>

      {/* Input manual como respaldo */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
          <Search className="w-4 h-4 inline mr-2" />
          Entrada Manual
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingresar DNI manualmente"
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-semibold"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onScanSuccess(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="text"]');
              if (input && input.value.trim()) {
                onScanSuccess(input.value.trim());
                input.value = '';
              }
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Estado y ayuda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <div className={`p-4 rounded-2xl border-2 ${isScanning ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-sm font-bold text-slate-700">
              {isScanning ? 'Cámara activa' : 'Cámara inactiva'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              Usa HTTPS para mejor compatibilidad
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDrawer = ({ acampante, onClose, onCheckIn, onToggleKit }) => {
  const normalizeField = (value) => {
    if (!value || value.toString().trim() === "") return "NO";
    return value.toString().toUpperCase().trim();
  };

  const normalizedComunidadAviva = normalizeField(acampante.comunidad_aviva);
  const normalizedCartaPastoral = normalizeField(acampante.carta_pastoral);

  const isFromAvivaCommunity = normalizedComunidadAviva === "SI";
  const requiresCartaPastoral = !isFromAvivaCommunity;
  const hasValidCartaPastoral = isFromAvivaCommunity ? true : normalizedCartaPastoral === "SI";
  const hasPagoTotal = acampante.estado_pago === "PAGO TOTAL";
  const canCheckIn = hasPagoTotal && hasValidCartaPastoral;

  const warnings = [];
  if (!hasPagoTotal) warnings.push({ type: 'pago', msg: `Estado de pago: ${acampante.estado_pago}` });
  if (requiresCartaPastoral && normalizedCartaPastoral !== "SI") {
    warnings.push({ type: 'carta', msg: 'Carta pastoral pendiente (requerida para externos)' });
  }

  const getCheckInMessage = () => {
    if (acampante.presente) return "✓ Check-in ya realizado";
    if (!hasPagoTotal) return `Bloqueado: Pago ${acampante.estado_pago}`;
    if (requiresCartaPastoral && acampante.carta_pastoral !== "SI")
      return "Bloqueado: Carta pastoral requerida";
    return "CONFIRMAR INGRESO";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full md:max-w-3xl md:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-br from-emerald-50 to-white border-b-2 border-slate-200 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{acampante.nombre}</h2>
            <p className="text-sm text-emerald-700 font-bold mt-1">Participante • ID #{acampante.dni}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {warnings.length > 0 && (
            <div className="space-y-3">
              {warnings.map((w, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${w.type === 'pago' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${w.type === 'pago' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  <span className={`text-sm font-bold ${w.type === 'pago' ? 'text-red-900' : 'text-amber-900'
                    }`}>{w.msg}</span>
                </div>
              ))}
            </div>
          )}

          {acampante.presente && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-bold text-emerald-900 block">Check-in realizado</span>
                {acampante.hora_ingreso && (
                  <span className="text-xs text-emerald-700">
                    {new Date(acampante.hora_ingreso.seconds * 1000).toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-slate-900" />
                <div>
                  <p className="font-black text-slate-900">Kit de Bienvenida</p>
                  <p className="text-xs text-slate-600 font-semibold">Pulsera • Remera • Credencial</p>
                </div>
              </div>
              <button
                onClick={() => onToggleKit(acampante.dni, !acampante.kit_entregado)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all border-2 ${acampante.kit_entregado
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500'
                  }`}
              >
                {acampante.kit_entregado ? '✓ Entregado' : 'Entregar Kit'}
              </button>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-bold">
                {acampante.kit_entregado ? (
                  <span className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    Kit registrado como entregado
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    Kit pendiente de entrega
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Información Personal</h3>
              <div className="space-y-3">
                <InfoField label="DNI" value={acampante.dni} />
                <InfoField label="Edad" value={acampante.edad} />
                <InfoField label="Sexo" value={acampante.sexo} />
                <InfoField label="Provincia" value={acampante.provincia} />
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contacto</h3>
              <div className="space-y-3">
                <InfoField label="Teléfono" value={acampante.telefono} link={`tel:${acampante.telefono}`} />
                <InfoField label="Email" value={acampante.mail} />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Alojamiento</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Tipo" value={acampante.alojamiento} />
              <InfoField label="Habitación" value={acampante.habitacion} />
            </div>
          </div>

          {acampante.taller && (
            <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Taller Asignado</h3>
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-600" />
                <span className="font-black text-emerald-900 text-lg">{acampante.taller}</span>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => !acampante.presente && canCheckIn && onCheckIn(acampante.dni)}
              disabled={acampante.presente || !canCheckIn}
              className={`w-full py-4 rounded-2xl font-black transition-all border-2 ${acampante.presente
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-default'
                : !canCheckIn
                  ? 'bg-red-50 text-red-700 border-red-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-lg'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                {acampante.presente && <CheckCircle className="w-5 h-5" />}
                {!canCheckIn && !acampante.presente && <AlertCircle className="w-5 h-5" />}
                <span>{getCheckInMessage()}</span>
              </div>
            </button>

            {acampante.telefono && (
              <a
                href={`tel:${acampante.telefono}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-slate-300 hover:border-emerald-500 rounded-2xl text-slate-900 font-bold transition-all"
              >
                <Phone className="w-5 h-5" />
                Llamar
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, link }) => {
  const displayValue = value || '-';
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      {link ? (
        <a href={link} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 break-all">
          {displayValue}
        </a>
      ) : (
        <p className="text-sm font-bold text-slate-900 break-words">{displayValue}</p>
      )}
    </div>
  );
};

const Dashboard = ({ acampantes }) => {
  const total = acampantes.length;
  const presentes = acampantes.filter(a => a.presente).length;
  const faltantes = total - presentes;
  const alertas = acampantes.filter(a => a.salud_alerta === "SI").length;
  const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

  const recentCheckIns = acampantes
    .filter(a => a.presente && a.hora_ingreso)
    .sort((a, b) => (b.hora_ingreso?.seconds || 0) - (a.hora_ingreso?.seconds || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <h1 className="text-4xl font-black text-slate-900">AVIVA CAMP 2026 anashe</h1>
        <p className="text-slate-600 font-semibold mt-2">Panel de Recepción y Control</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard icon={UserCheck} label="Presentes" value={presentes} color="emerald" />
        <KPICard icon={UserX} label="Faltantes" value={faltantes} color="orange" />
        <KPICard icon={AlertCircle} label="Alertas Salud" value={alertas} color="red" />
      </div>

      <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Asistencia General</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="14" fill="none" className="text-slate-200" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="14"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - porcentaje / 100)}`}
                className="text-emerald-600"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-slate-900">{porcentaje}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Últimos Check-ins</h3>
        <div className="space-y-3">
          {recentCheckIns.length > 0 ? (
            recentCheckIns.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-slate-50 border-2 border-transparent hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{a.nombre}</p>
                    <p className="text-xs text-slate-500 font-semibold">{a.iglesia || 'Sin iglesia'}</p>
                  </div>
                </div>
                <p className="text-xs font-black text-slate-600">
                  {a.hora_ingreso ? new Date(a.hora_ingreso.seconds * 1000).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No hay check-ins registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${colors[color]}`}>
          <Icon className="w-7 h-7" strokeWidth={2.5} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">{label}</p>
    </div>
  );
};

const HabitacionesMejoradas = ({ acampantes, onSelectAcampante, setNotification }) => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acampantesSinHabitacion, setAcampantesSinHabitacion] = useState([]);
  const [draggedAcampante, setDraggedAcampante] = useState(null);
  const [targetHabitacion, setTargetHabitacion] = useState(null);
  const [filtroGenero, setFiltroGenero] = useState('todos');

  // Cargar habitaciones
  useEffect(() => {
    loadHabitaciones();
  }, []);

  const loadHabitaciones = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'habitaciones'));
      const habitacionesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por número
      habitacionesData.sort((a, b) => {
        return a.numero.localeCompare(b.numero, undefined, { numeric: true });
      });

      setHabitaciones(habitacionesData);
    } catch (error) {
      console.error('Error cargando habitaciones:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar habitaciones'
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar acampantes sin habitación
  useEffect(() => {
    const actualizarAsignaciones = () => {
      // Obtener todos los DNI asignados
      const asignados = habitaciones.flatMap(h => h.ocupantes || []);

      // Filtrar acampantes no asignados
      const sinAsignar = acampantes.filter(a => !asignados.includes(a.dni));

      setAcampantesSinHabitacion(sinAsignar);
    };

    if (habitaciones.length > 0) {
      actualizarAsignaciones();
    }
  }, [habitaciones, acampantes]);

  // Función simple para asignar acampante a habitación
  const asignarAcampante = async (dni, habitacionId) => {
    try {
      const acampante = acampantes.find(a => a.dni === dni);
      if (!acampante) return;

      const habitacion = habitaciones.find(h => h.id === habitacionId);
      if (!habitacion) return;

      // Verificar capacidad
      const ocupantesActuales = habitacion.ocupantes?.length || 0;
      if (ocupantesActuales >= habitacion.capacidad) {
        setNotification({
          type: 'error',
          message: `Habitación ${habitacion.numero} está llena (${habitacion.capacidad}/${habitacion.capacidad})`
        });
        return;
      }

      // Verificar compatibilidad de género (simplificado)
      if (habitacion.genero !== 'mixta') {
        const generoAcampante = acampante.sexo.toLowerCase();
        const generoHabitacion = habitacion.genero;

        // Convertir "Masculino" -> "hombre", "Femenino" -> "mujer"
        const generoMapeado = generoAcampante.includes('masculino') ? 'hombre' :
          generoAcampante.includes('femenino') ? 'mujer' :
            generoAcampante;

        if (generoHabitacion !== generoMapeado) {
          setNotification({
            type: 'error',
            message: `❌ ${acampante.nombre} no puede ir en habitación de ${habitacion.genero === 'hombre' ? 'hombres' : 'mujeres'}`
          });
          return;
        }
      }

      // Actualizar habitación en Firebase
      const habitacionRef = doc(db, 'habitaciones', habitacionId);
      const nuevosOcupantes = [...(habitacion.ocupantes || []), dni];

      await updateDoc(habitacionRef, {
        ocupantes: nuevosOcupantes
      });

      // Actualizar estado local
      setHabitaciones(prev => prev.map(h =>
        h.id === habitacionId
          ? { ...h, ocupantes: nuevosOcupantes }
          : h
      ));

      // Actualizar acampante en Firebase (mantener campo habitación por compatibilidad)
      const acampanteRef = doc(db, 'acampantes', dni);
      await updateDoc(acampanteRef, {
        habitacion: habitacion.numero
      });

      // Notificación de éxito
      setNotification({
        type: 'success',
        message: `${acampante.nombre} asignado a habitación ${habitacion.numero}`
      });

      // Limpiar selección
      setDraggedAcampante(null);
      setTargetHabitacion(null);

    } catch (error) {
      console.error('Error asignando acampante:', error);
      setNotification({
        type: 'error',
        message: 'Error al asignar habitación'
      });
    }
  };

  // Función para quitar acampante de habitación
  const quitarAcampante = async (dni, habitacionId) => {
    try {
      const habitacionRef = doc(db, 'habitaciones', habitacionId);
      const habitacion = habitaciones.find(h => h.id === habitacionId);

      if (!habitacion) return;

      const nuevosOcupantes = habitacion.ocupantes?.filter(id => id !== dni) || [];

      await updateDoc(habitacionRef, {
        ocupantes: nuevosOcupantes
      });

      // Actualizar acampante
      const acampanteRef = doc(db, 'acampantes', dni);
      await updateDoc(acampanteRef, {
        habitacion: ''
      });

      // Actualizar estado local
      setHabitaciones(prev => prev.map(h =>
        h.id === habitacionId
          ? { ...h, ocupantes: nuevosOcupantes }
          : h
      ));

      // Notificación
      const acampante = acampantes.find(a => a.dni === dni);
      setNotification({
        type: 'success',
        message: `${acampante?.nombre || 'Acampante'} removido de habitación ${habitacion.numero}`
      });

    } catch (error) {
      console.error('Error quitando acampante:', error);
      setNotification({
        type: 'error',
        message: 'Error al remover acampante de la habitación'
      });
    }
  };

  // Usar useMemo para cálculos costosos
  const { habitacionesFiltradas, acampantesFiltrados, stats } = useMemo(() => {
    const habitacionesFiltradas = habitaciones.filter(habitacion => {
      if (filtroGenero === 'todos') return true;
      if (filtroGenero === 'mixta') return habitacion.genero === 'mixta';
      return habitacion.genero === filtroGenero;
    });

    const acampantesFiltrados = acampantesSinHabitacion.filter(acampante => {
      if (filtroGenero === 'todos') return true;
      if (filtroGenero === 'mixta') return true;

      const generoAcampante = acampante.sexo.toLowerCase();
      const generoFiltro = filtroGenero;

      if (generoAcampante.includes('masculino') && generoFiltro === 'hombre') return true;
      if (generoAcampante.includes('femenino') && generoFiltro === 'mujer') return true;
      return false;
    });

    const stats = {
      totalAcampantes: acampantes.length,
      totalHabitaciones: habitaciones.length,
      habitacionesOcupadas: habitaciones.filter(h => (h.ocupantes?.length || 0) > 0).length,
      habitacionesDisponibles: habitaciones.filter(h => (h.ocupantes?.length || 0) < h.capacidad).length,
      acampantesAsignados: habitaciones.reduce((acc, h) => acc + (h.ocupantes?.length || 0), 0),
      acampantesSinAsignar: acampantesSinHabitacion.length
    };

    return { habitacionesFiltradas, acampantesFiltrados, stats };
  }, [habitaciones, acampantesSinHabitacion, filtroGenero, acampantes.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold">Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Asignación de Habitaciones</h1>
            <p className="text-slate-600 font-semibold mt-2">
              Arrastra acampantes a las habitaciones • {acampantes.length} participantes
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadHabitaciones}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Recargar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-200">
          <p className="text-sm text-slate-600 font-medium">Total Acampantes</p>
          <p className="text-2xl font-black text-slate-900">{stats.totalAcampantes}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-200">
          <p className="text-sm text-slate-600 font-medium">Asignados</p>
          <p className="text-2xl font-black text-emerald-600">{stats.acampantesAsignados}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border-2 border-orange-200">
          <p className="text-sm text-slate-600 font-medium">Sin Asignar</p>
          <p className="text-2xl font-black text-orange-600">{stats.acampantesSinAsignar}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border-2 border-blue-200">
          <p className="text-sm text-slate-600 font-medium">Habitaciones</p>
          <p className="text-2xl font-black text-blue-600">{stats.totalHabitaciones}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroGenero('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${filtroGenero === 'todos' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroGenero('hombre')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${filtroGenero === 'hombre' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Hombres
          </button>
          <button
            onClick={() => setFiltroGenero('mujer')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${filtroGenero === 'mujer' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Mujeres
          </button>
          <button
            onClick={() => setFiltroGenero('mixta')}
            className={`px-4 py-2 rounded-lg text-sm font-bold ${filtroGenero === 'mixta' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Mixtas
          </button>
        </div>
      </div>

      {/* Área de arrastre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna 1: Acampantes sin habitación */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Acampantes sin habitación ({acampantesFiltrados.length})
          </h3>

          <div className="bg-white rounded-2xl p-4 border-2 border-orange-200 max-h-[500px] overflow-y-auto">
            {acampantesFiltrados.length > 0 ? (
              <div className="space-y-2">
                {acampantesFiltrados.map(acampante => (
                  <div
                    key={acampante.dni}
                    draggable
                    onDragStart={(e) => {
                      setDraggedAcampante(acampante);
                      e.dataTransfer.setData('text/plain', acampante.dni);
                    }}
                    onClick={() => onSelectAcampante(acampante)}
                    className="p-3 rounded-lg border-2 border-slate-200 hover:border-emerald-500 cursor-pointer hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{acampante.nombre}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">DNI: {acampante.dni}</span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                              {acampante.sexo === 'Masculino' ? 'Hombre' : 'Mujer'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Sin asignar
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">Todos los acampantes están asignados</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna 2: Habitaciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Habitaciones ({habitacionesFiltradas.length})
          </h3>

          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {habitacionesFiltradas.map(habitacion => {
                const ocupantesActuales = habitacion.ocupantes?.length || 0;
                const disponible = ocupantesActuales < habitacion.capacidad;
                const porcentaje = (ocupantesActuales / habitacion.capacidad) * 100;

                return (
                  <div
                    key={habitacion.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (disponible) {
                        setTargetHabitacion(habitacion.id);
                      }
                    }}
                    onDragLeave={() => setTargetHabitacion(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      if (draggedAcampante && disponible) {
                        await asignarAcampante(draggedAcampante.dni, habitacion.id);
                      }
                      setTargetHabitacion(null);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${targetHabitacion === habitacion.id && disponible
                      ? 'border-emerald-500 bg-emerald-50'
                      : disponible
                        ? 'border-slate-200 hover:border-emerald-300'
                        : 'border-red-200 bg-red-50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-black text-slate-900">Habitación {habitacion.numero}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">Piso {habitacion.piso}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className="text-xs text-slate-500">{habitacion.tipo}</span>
                          <span className="text-xs text-slate-300">•</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${habitacion.genero === 'hombre' ? 'bg-blue-100 text-blue-700' :
                            habitacion.genero === 'mujer' ? 'bg-pink-100 text-pink-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                            {habitacion.genero === 'hombre' ? 'Solo hombres' :
                              habitacion.genero === 'mujer' ? 'Solo mujeres' : 'Mixta'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${disponible ? 'text-emerald-600' : 'text-red-600'}`}>
                          {ocupantesActuales}/{habitacion.capacidad}
                        </span>
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${disponible ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ocupantes */}
                    <div className="space-y-2">
                      {habitacion.ocupantes?.map(dni => {
                        const acampante = acampantes.find(a => a.dni === dni);
                        if (!acampante) return null;

                        return (
                          <div
                            key={dni}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {acampante.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-slate-900">
                                {acampante.nombre.split(' ')[0]}
                              </span>
                            </div>
                            <button
                              onClick={() => quitarAcampante(dni, habitacion.id)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}

                      {disponible && (
                        <div className="pt-2">
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center">
                            <p className="text-sm text-slate-500">
                              {targetHabitacion === habitacion.id && draggedAcampante
                                ? `Soltar aquí para asignar a ${draggedAcampante.nombre}`
                                : 'Arrastra un acampante aquí'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-bold text-slate-900">Instrucciones:</p>
            <p className="text-sm text-slate-600">
              1. Arrastra un acampante desde la columna izquierda a una habitación disponible.
              2. Las habitaciones se filtran por género automáticamente.
              3. Haz clic en la ✕ para quitar a un acampante de una habitación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GruposView = ({ acampantes, onSelectAcampante, setNotification }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrearGrupo, setShowCrearGrupo] = useState(false);
  const [acampanteSeleccionado, setAcampanteSeleccionado] = useState(null);
  const [codigoAcceso, setCodigoAcceso] = useState('');

  // Cargar grupos
  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'grupos_pequenos'));
      const gruposData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGrupos(gruposData);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear grupo de WhatsApp
  const crearGrupoWhatsApp = (grupo) => {
    const lider = acampantes.find(a => a.dni === grupo.lider_id);
    const miembrosNumeros = grupo.miembros
      .map(dni => {
        const acampante = acampantes.find(a => a.dni === dni);
        return acampante?.telefono;
      })
      .filter(tel => tel)
      .map(tel => tel.replace(/\D/g, '')); // Quitar caracteres no numéricos

    // Generar link de WhatsApp (método simple)
    const numerosTexto = miembrosNumeros.join(',');
    const mensaje = `*${grupo.nombre} - AVIVA CAMP 2026*%0A%0AHola equipo! Este es nuestro grupo de WhatsApp para coordinar nuestras actividades.`;

    // Dos opciones:
    // 1. Crear link para chat grupal (requiere que el líder cree el grupo primero)
    // 2. Crear link para mensaje individual con todos los números

    // Opción 2 (más simple):
    const whatsappLink = `https://wa.me/?text=${mensaje}`;

    // Abrir en nueva pestaña
    window.open(whatsappLink, '_blank');

    setNotification({
      type: 'info',
      message: 'Abre WhatsApp y agrega manualmente los números del grupo'
    });
  };

  // Vista de líder con código de acceso
  const VistaLider = () => {
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [grupoLider, setGrupoLider] = useState(null);
    const [accesoConcedido, setAccesoConcedido] = useState(false);

    const verificarCodigo = () => {
      const grupo = grupos.find(g => g.codigo_acceso === codigoIngresado);
      if (grupo) {
        setGrupoLider(grupo);
        setAccesoConcedido(true);
      } else {
        setNotification({
          type: 'error',
          message: 'Código de acceso incorrecto'
        });
      }
    };

    if (!accesoConcedido) {
      return (
        <div className="max-w-md mx-auto mt-10">
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-4">Acceso Líder</h3>
            <p className="text-slate-600 mb-6">Ingresa el código de acceso de tu grupo</p>
            <input
              type="text"
              value={codigoIngresado}
              onChange={(e) => setCodigoIngresado(e.target.value)}
              placeholder="Ej: ALFA2024"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl mb-4"
            />
            <button
              onClick={verificarCodigo}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Acceder a mi grupo
            </button>
          </div>
        </div>
      );
    }

    // Vista del líder después de acceder
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{grupoLider.nombre}</h2>
              <p className="text-blue-600 font-semibold">Vista de Líder</p>
            </div>
            <button
              onClick={() => crearGrupoWhatsApp(grupoLider)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Crear grupo WhatsApp
            </button>
          </div>
        </div>

        {/* Tareas del grupo */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 mb-6">
          <h3 className="text-lg font-black text-slate-900 mb-4">Tareas asignadas</h3>
          {/* Lista de tareas */}
        </div>

        {/* Miembros del grupo */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
          <h3 className="text-lg font-black text-slate-900 mb-4">Miembros del grupo</h3>
          {/* Lista de miembros */}
        </div>
      </div>
    );
  };

  // Resto del componente...
};


const CrearGrupoModal = ({ acampantes, onClose, onCreate }) => {
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [liderId, setLiderId] = useState('');
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState([]);
  const [colorGrupo, setColorGrupo] = useState('#3B82F6');

  const handleCrear = async () => {
    if (!nombreGrupo || !liderId) {
      alert('Completa los campos requeridos');
      return;
    }

    const grupo = {
      nombre: nombreGrupo,
      lider_id: liderId,
      lider_nombre: acampantes.find(a => a.dni === liderId)?.nombre,
      codigo_acceso: generarCodigoAcceso(),
      color: colorGrupo,
      miembros: [...miembrosSeleccionados, liderId], // Incluir líder
      tareas: [],
      activo: true,
      fecha_creacion: new Date().toISOString()
    };

    await onCreate(grupo);
    onClose();
  };

  const generarCodigoAcceso = () => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    let codigo = '';

    // 4 letras + 4 números
    for (let i = 0; i < 4; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    for (let i = 0; i < 4; i++) {
      codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }

    return codigo;
  };

};

const generarLinkWhatsAppMejorado = (grupo, acampantes) => {
  const lider = acampantes.find(a => a.dni === grupo.lider_id);
  const miembros = grupo.miembros
    .map(dni => acampantes.find(a => a.dni === dni))
    .filter(a => a && a.telefono);

  // Formatear números internacionalmente (Argentina: +54 9 XXX XXX XXXX)
  const numerosFormateados = miembros.map(a => {
    let telefono = a.telefono.replace(/\D/g, '');
    if (telefono.startsWith('0')) telefono = telefono.substring(1);
    if (!telefono.startsWith('54')) telefono = '54' + telefono;
    return telefono;
  });

  // Crear mensaje con todos los números
  const numerosTexto = numerosFormateados.join('%0A');
  const mensaje = `*${grupo.nombre} - AVIVA CAMP 2026*%0A%0ALíder: ${lider?.nombre}%0A%0ANúmeros del equipo:%0A${numerosTexto}%0A%0A¡Coordinen sus actividades aquí!`;

  return `https://wa.me/?text=${mensaje}`;
};
const SearchView = ({ acampantes, onSelectAcampante }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = acampantes.filter(a =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.dni.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <h1 className="text-4xl font-black text-slate-900">Búsqueda</h1>
        <p className="text-slate-600 font-semibold mt-2">Encuentra participantes por nombre o DNI</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((a, i) => (
          <div
            key={i}
            onClick={() => onSelectAcampante(a)}
            className="bg-white rounded-2xl p-5 border-2 border-slate-200 hover:border-emerald-500 cursor-pointer transition-all shadow-sm hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{a.nombre}</p>
                  <p className="text-sm text-slate-600 font-semibold">DNI: {a.dni} • {a.iglesia || 'Sin iglesia'}</p>
                </div>
              </div>
              {a.presente && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border-2 border-emerald-200">
                  <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                  <span className="font-bold text-sm">Presente</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && searchTerm && (
          <div className="bg-white rounded-2xl p-12 border-2 border-slate-200 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-lg">No se encontraron resultados</p>
            <p className="text-slate-400 text-sm mt-2">Intenta con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TalleresView = ({ acampantes, onSelectAcampante }) => {
  const talleres = {};

  acampantes.forEach(a => {
    if (a.taller) {
      if (!talleres[a.taller]) {
        talleres[a.taller] = [];
      }
      talleres[a.taller].push(a);
    }
  });

  const sinTaller = acampantes.filter(a => !a.taller);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <h1 className="text-4xl font-black text-slate-900">Talleres</h1>
        <p className="text-slate-600 font-semibold mt-2">Organización de talleres y actividades</p>
      </div>

      {Object.entries(talleres).sort().map(([taller, participantes]) => {
        const presentes = participantes.filter(p => p.presente).length;
        const total = participantes.length;
        const porcentaje = Math.round((presentes / total) * 100);

        return (
          <div key={taller} className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-5 pb-5 border-b-2 border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{taller}</h3>
                  <p className="text-sm text-slate-600 font-semibold mt-1">{total} participantes inscriptos</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-2">
                  <span className="text-2xl font-black text-emerald-700">{presentes}</span>
                  <span className="text-slate-400 font-bold">/ {total}</span>
                </div>
                <div className="mt-2 w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {participantes.map((a, i) => (
                <div
                  key={i}
                  onClick={() => onSelectAcampante(a)}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 cursor-pointer hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{a.nombre}</span>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border-2 ${a.presente
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    {a.presente ? '✓ Presente' : 'Ausente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {sinTaller.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-lg">
          <div className="mb-5 pb-5 border-b-2 border-amber-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
              <div>
                <h3 className="text-xl font-black text-slate-900">Sin Taller Asignado</h3>
                <p className="text-sm text-amber-600 font-bold mt-1">{sinTaller.length} acampantes pendientes</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sinTaller.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-600" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{a.nombre}</span>
                </div>
              </div>
            ))}
            {sinTaller.length > 10 && (
              <div className="col-span-2 text-center py-4 border-t-2 border-amber-200">
                <p className="text-sm text-amber-600 font-semibold">
                  Y {sinTaller.length - 10} más sin taller asignado...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Agenda = () => {
  const cronograma = [
    { hora: '08:00', titulo: 'Desayuno', ubicacion: 'Comedor Principal', icon: '🍳' },
    { hora: '09:30', titulo: 'Alabanza Matutina', ubicacion: 'Auditorio', icon: '🎵' },
    { hora: '11:00', titulo: 'Taller 1', ubicacion: 'Salas A-D', icon: '📚' },
    { hora: '13:00', titulo: 'Almuerzo', ubicacion: 'Comedor Principal', icon: '🍽️' },
    { hora: '15:00', titulo: 'Actividades Recreativas', ubicacion: 'Campo Deportivo', icon: '⚽' },
    { hora: '18:00', titulo: 'Cena', ubicacion: 'Comedor Principal', icon: '🍕' },
    { hora: '20:00', titulo: 'Reunión General', ubicacion: 'Auditorio', icon: '🎤' },
  ];

  const ahora = new Date();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  const esActivo = (hora) => {
    const [h, m] = hora.split(':').map(Number);
    const minutos = h * 60 + m;
    return Math.abs(horaActual - minutos) < 90;
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <h1 className="text-4xl font-black text-slate-900">Agenda</h1>
        <p className="text-slate-600 font-semibold mt-2">Cronograma del campamento</p>
      </div>

      <div className="space-y-4">
        {cronograma.map((item, i) => {
          const activo = esActivo(item.hora);

          return (
            <div
              key={i}
              className={`bg-white rounded-3xl p-6 border-2 transition-all ${activo
                ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                : 'border-slate-200 shadow-lg'
                }`}
            >
              <div className="flex gap-5">
                <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${activo
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg'
                  : 'bg-slate-100 border-2 border-slate-200'
                  }`}>
                  <span className={`text-2xl font-black ${activo ? 'text-white' : 'text-slate-900'}`}>
                    {item.hora.split(':')[0]}
                  </span>
                  <span className={`text-sm font-bold ${activo ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.hora.split(':')[1]}
                  </span>
                </div>
                <div className="flex-1">
                  {activo && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">En Curso</span>
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.titulo}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    <p className="text-sm text-slate-600 font-semibold">{item.ubicacion}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function AvivaApp() {
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [acampantes, setAcampantes] = useState([]);
  const [selectedAcampante, setSelectedAcampante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadAcampantes();
  }, []);
  const handleUpdateHabitacion = async (dni, nuevaHabitacion) => {
    try {
      const acampanteRef = doc(db, 'acampantes', dni);
      await updateDoc(acampanteRef, {
        habitacion: nuevaHabitacion
      });

      setAcampantes(prev => prev.map(a =>
        a.dni === dni ? { ...a, habitacion: nuevaHabitacion } : a
      ));

      setSelectedAcampante(prev => prev ? {
        ...prev,
        habitacion: nuevaHabitacion
      } : null);

      setNotification({
        type: 'success',
        message: `✓ Habitación actualizada a: ${nuevaHabitacion}`
      });

    } catch (error) {
      console.error('Error al actualizar habitación ja:', error);
      setNotification({
        type: 'error',
        message: '✗ Error al actualizar habitación'
      });
    }
  };


  const loadAcampantes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'acampantes'));
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setAcampantes(data);
    } catch (error) {
      console.error('Error cargando acampantes:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar datos. Verifica tu conexión.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    setIsSyncing(true);
    try {
      await loadAcampantes();
      setLastSync(new Date());
      setNotification({
        type: 'success',
        message: '✓ Datos sincronizados correctamente'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: '✗ Error al sincronizar datos'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScan = (dni) => {
    const acampante = acampantes.find(a => a.dni === dni);
    if (acampante) {
      setSelectedAcampante(acampante);
    } else {
      setNotification({
        type: 'error',
        message: 'Acampante no encontrado. Verifica el DNI ingresado.'
      });
    }
  };

  const handleCheckIn = async (dni) => {
    try {
      const acampanteRef = doc(db, 'acampantes', dni);
      await updateDoc(acampanteRef, {
        presente: true,
        hora_ingreso: serverTimestamp()
      });

      setAcampantes(prev => prev.map(a =>
        a.dni === dni ? {
          ...a,
          presente: true,
          hora_ingreso: { seconds: Math.floor(Date.now() / 1000) }
        } : a
      ));

      setSelectedAcampante(prev => prev ? {
        ...prev,
        presente: true,
        hora_ingreso: { seconds: Math.floor(Date.now() / 1000) }
      } : null);

      setNotification({
        type: 'success',
        message: '✓ Check-in realizado exitosamente!'
      });

    } catch (error) {
      setNotification({
        type: 'error',
        message: '✗ Error al registrar check-in'
      });
    }
  };

  const handleToggleKit = async (dni, nuevoEstado) => {
    try {
      const acampanteRef = doc(db, 'acampantes', dni);
      await updateDoc(acampanteRef, {
        kit_entregado: nuevoEstado
      });

      setAcampantes(prev => prev.map(a =>
        a.dni === dni ? { ...a, kit_entregado: nuevoEstado } : a
      ));

      setSelectedAcampante(prev => prev ? {
        ...prev,
        kit_entregado: nuevoEstado
      } : null);

      setNotification({
        type: 'success',
        message: nuevoEstado ? '✓ Kit marcado como entregado' : '○ Kit marcado como no entregado'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: '✗ Error al actualizar estado del kit'
      });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scanner', label: 'Escanear', icon: QrCode },
    { id: 'habitaciones', label: 'Habitaciones', icon: Building2 },
    { id: 'grupos', label: 'Grupos', icon: Users }, // Nueva pestaña
    { id: 'busqueda', label: 'Búsqueda', icon: Search },
    { id: 'talleres', label: 'Talleres', icon: Award },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-700 font-bold text-lg">Cargando acampantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <header className="bg-white/90 backdrop-blur-lg border-b-2 border-slate-200 p-5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <span className="text-emerald-600">⛰️</span>
              AVIVA CAMP 2026
            </h1>
            <p className="text-slate-600 font-semibold text-sm mt-1">Recepción y Control</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleForceRefresh}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={2.5} />
              ) : (
                <Download className="w-5 h-5" strokeWidth={2.5} />
              )}
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            {lastSync && (
              <span className="text-xs text-slate-500 font-semibold">
                Últ. sync: {lastSync.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 pb-28">
        {activeTab === 'dashboard' && <Dashboard acampantes={acampantes} />}
        {activeTab === 'scanner' && (
          <div className="space-y-6 pb-24 max-w-4xl mx-auto">
            <QRScanner onScanSuccess={handleScan} />
          </div>
        )}
        {activeTab === 'habitaciones' && (
          <HabitacionesMejoradas
            acampantes={acampantes}
            onSelectAcampante={setSelectedAcampante}
            setNotification={setNotification}

          />
        )}
        {activeTab === 'grupos' && (
          <GruposView
            acampantes={acampantes}
            onSelectAcampante={setSelectedAcampante}
            setNotification={setNotification}
          />
        )}
        {activeTab === 'busqueda' && (
          <SearchView
            acampantes={acampantes}
            onSelectAcampante={setSelectedAcampante}
          />
        )}
        {activeTab === 'talleres' && (
          <TalleresView
            acampantes={acampantes}
            onSelectAcampante={setSelectedAcampante}
          />
        )}
        {activeTab === 'agenda' && <Agenda />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-slate-200 p-3 flex justify-around z-50 shadow-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 min-w-[70px] ${activeTab === tab.id
              ? 'text-emerald-600 bg-emerald-50 border-2 border-emerald-500 shadow-lg scale-105'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
              }`}
          >
            <tab.icon className="w-6 h-6" strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      {selectedAcampante && (
        <ProfileDrawer
          acampante={selectedAcampante}
          onClose={() => setSelectedAcampante(null)}
          onCheckIn={handleCheckIn}
          onToggleKit={handleToggleKit}
        />
      )}

      <style>{`
      /* En el <style> del componente AvivaApp */
#reader {
  width: 100% !important;
  height: 100% !important;
  position: relative !important;
}

#reader video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 20px !important;
}

#reader canvas {
  display: none; /* Ocultar el canvas si es necesario */
}
       @keyframes scan {
    0%, 100% { top: 0; }
    50% { top: calc(100% - 4px); }
  }
  .animate-scan {
    animation: scan 2s ease-in-out infinite;
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
          @keyframes scan {
            0%, 100% { top: 0; }
            50% { top: calc(100% - 4px); }
          }
          .animate-scan {
            animation: scan 2s ease-in-out infinite;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>
    </div>
  );
}