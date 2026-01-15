import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
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

const HabitacionesMejoradas = ({ acampantes, onSelectAcampante, onUpdateHabitacion }) => {
  const [editingHabitacion, setEditingHabitacion] = useState(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPiso, setFiltroPiso] = useState('todos');

  // Calcular estadísticas
  const totalAcampantes = acampantes.length;
  const presentes = acampantes.filter(a => a.presente).length;
  const sinHabitacion = acampantes.filter(a => !a.habitacion || a.habitacion === 'Sin asignar');
  const ocupacionTotal = totalAcampantes - sinHabitacion.length;
  const porcentajeOcupacion = totalAcampantes > 0 ? Math.round((ocupacionTotal / totalAcampantes) * 100) : 0;

  // Agrupar por habitación
  const habitaciones = {};
  acampantes.forEach(a => {
    const hab = a.habitacion || 'Sin asignar';
    if (!habitaciones[hab]) {
      habitaciones[hab] = {
        hombres: [],
        mujeres: [],
        total: 0,
        presentes: 0,
        tipo: 'Standard'
      };
    }
    if (a.sexo === 'Hombre') habitaciones[hab].hombres.push(a);
    else if (a.sexo === 'Mujer') habitaciones[hab].mujeres.push(a);
    habitaciones[hab].total++;
    if (a.presente) habitaciones[hab].presentes++;

    // Determinar tipo de habitación basado en el número
    if (hab.includes('Suite') || hab.includes('suite')) habitaciones[hab].tipo = 'Deluxe Suite';
    else if (hab.includes('Staff')) habitaciones[hab].tipo = 'Staff Suite';
  });

  // Filtrar habitaciones
  const habitacionesFiltradas = Object.entries(habitaciones)
    .filter(([nombre, datos]) => {
      if (filtroGenero === 'hombre' && datos.hombres.length === 0) return false;
      if (filtroGenero === 'mujer' && datos.mujeres.length === 0) return false;
      if (filtroPiso !== 'todos') {
        if (filtroPiso === '1' && !nombre.startsWith('1')) return false;
        if (filtroPiso === '2' && !nombre.startsWith('2')) return false;
        if (filtroPiso === '3' && !nombre.startsWith('3')) return false;
      }
      if (searchTerm && !nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
        const nombresHuespedes = [...datos.hombres, ...datos.mujeres]
          .some(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!nombresHuespedes) return false;
      }
      return true;
    });

  // Ordenar habitaciones
  const habitacionesOrdenadas = habitacionesFiltradas.sort(([a], [b]) => {
    if (a === 'Sin asignar') return 1;
    if (b === 'Sin asignar') return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const handleAsignarHabitacion = async (dni) => {
    if (!nuevaHabitacion.trim()) {
      alert('Ingresa un número de habitación');
      return;
    }
    try {
      await onUpdateHabitacion(dni, nuevaHabitacion);
      setEditingHabitacion(null);
      setNuevaHabitacion('');
    } catch (error) {
      alert('Error al asignar habitación');
    }
  };

  const getInitials = (nombre) => {
    return nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border-2 border-slate-200">
        <h1 className="text-4xl font-black text-slate-900">Room Assignments</h1>
        <p className="text-slate-600 font-semibold mt-2">Efficiently manage occupancy and logistics for camp participants</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms or guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-semibold"
          />
        </div>
      </div>

      {/* Estadísticas globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <p className="text-slate-600 text-sm font-medium">Total Participants</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-600">{totalAcampantes}</p>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {presentes} Presentes
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <p className="text-slate-600 text-sm font-medium">Rooms Occupied</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-blue-600">
              {Object.keys(habitaciones).filter(h => h !== 'Sin asignar').length}
            </p>
            <span className="text-xs text-slate-500 font-bold">habilitadas</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <p className="text-slate-600 text-sm font-medium">Unassigned Guests</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-orange-600">{sinHabitacion.length}</p>
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Needs assignment
            </span>
          </div>
        </div>
      </div>

      {/* Barra de progreso y filtros */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between mb-2">
              <p className="text-slate-900 text-sm font-bold">Overall Occupancy</p>
              <p className="text-emerald-600 text-sm font-black">
                {ocupacionTotal} / {totalAcampantes}
              </p>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${porcentajeOcupacion}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
              {porcentajeOcupacion}% of capacity reached
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroGenero('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filtroGenero === 'todos'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              All Genders
            </button>
            <button
              onClick={() => setFiltroGenero('hombre')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filtroGenero === 'hombre'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Men Only
            </button>
            <button
              onClick={() => setFiltroGenero('mujer')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filtroGenero === 'mujer'
                ? 'bg-pink-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              Women Only
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1" />

            <button
              onClick={() => setFiltroPiso('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filtroPiso === 'todos'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              All Floors
            </button>
            {['1', '2', '3'].map(piso => (
              <button
                key={piso}
                onClick={() => setFiltroPiso(piso)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filtroPiso === piso
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Floor {piso}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de habitaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitacionesOrdenadas.map(([nombre, datos]) => {
          const isSinAsignar = nombre === 'Sin asignar';
          const isFull = datos.total >= 4; // Asumimos 4 camas por habitación
          const isEmpty = datos.total === 0;
          const totalHuespedes = datos.hombres.length + datos.mujeres.length;

          return (
            <div
              key={nombre}
              className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden flex flex-col group transition-all ${isSinAsignar
                ? 'border-orange-300'
                : isFull
                  ? 'border-emerald-300'
                  : isEmpty
                    ? 'border-slate-300'
                    : 'border-blue-300 hover:border-blue-500'
                }`}
            >
              {/* Header de la habitación */}
              <div className={`p-5 border-b-2 flex justify-between items-start ${isSinAsignar
                ? 'bg-orange-50 border-orange-200'
                : isFull
                  ? 'bg-emerald-50 border-emerald-200'
                  : isEmpty
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {isSinAsignar ? 'Unassigned Guests' : `Room ${nombre}`}
                  </h3>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight mt-1">
                    {datos.tipo} • {nombre.startsWith('1') ? 'Ground Floor' :
                      nombre.startsWith('2') ? 'Floor 1' :
                        nombre.startsWith('3') ? 'Floor 2' : 'Various'}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  {!isSinAsignar && !isEmpty && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-black mb-1 ${isFull
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {totalHuespedes}/4 BEDS
                    </span>
                  )}

                  {isSinAsignar && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        {datos.total} GUESTS
                      </span>
                    </div>
                  )}

                  {!isSinAsignar && totalHuespedes > 0 && (
                    <div className="flex -space-x-2">
                      {[...datos.hombres, ...datos.mujeres]
                        .slice(0, 3)
                        .map((acampante, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700"
                          >
                            {getInitials(acampante.nombre)}
                          </div>
                        ))}
                      {totalHuespedes > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          +{totalHuespedes - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de huéspedes */}
              <div className="p-5 flex-1 space-y-3">
                {isSinAsignar ? (
                  <div className="space-y-3">
                    {datos.hombres.concat(datos.mujeres).slice(0, 4).map((acampante, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectAcampante(acampante)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            {getInitials(acampante.nombre)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{acampante.nombre}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              {acampante.sexo?.toUpperCase()} • {acampante.edad} años
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingHabitacion(acampante.dni);
                          }}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Building2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {datos.total > 4 && (
                      <div className="text-center pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 font-semibold">
                          And {datos.total - 4} more unassigned guests...
                        </p>
                      </div>
                    )}
                  </div>
                ) : isEmpty ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3 opacity-60">
                    <Building2 className="w-12 h-12 text-slate-400" />
                    <p className="text-sm font-bold text-center text-slate-500">
                      No guests assigned yet
                    </p>
                    <button className="mt-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                      Quick Assign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {datos.hombres.concat(datos.mujeres).map((acampante, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectAcampante(acampante)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${acampante.presente
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                            }`}>
                            {getInitials(acampante.nombre)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{acampante.nombre}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              {acampante.sexo?.toUpperCase()} • {acampante.edad} años
                              {acampante.presente && ' • ✓ Presente'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingHabitacion(acampante.dni);
                          }}
                          className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Building2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {!isFull && totalHuespedes < 4 && (
                      <div className="pt-2">
                        <button className="w-full border-2 border-dashed border-slate-300 rounded-lg py-2 text-slate-400 text-xs font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Guest
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer de la habitación */}
              <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-200">
                <button className="flex-1 bg-white border border-slate-300 rounded-lg py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors">
                  Edit Room
                </button>
                <button className="flex-1 bg-white border border-slate-300 rounded-lg py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 transition-colors">
                  View Logs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón flotante para asignar */}
      {editingHabitacion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-black text-slate-900 mb-2">Assign Room</h3>
            <p className="text-slate-600 text-sm mb-4">
              Enter the room number for this guest
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={nuevaHabitacion}
                onChange={(e) => setNuevaHabitacion(e.target.value)}
                placeholder="e.g., 101, 202, Suite-1"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                {['101', '102', '201', '202', '301', 'Suite'].map(room => (
                  <button
                    key={room}
                    onClick={() => setNuevaHabitacion(room)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold transition-colors"
                  >
                    {room}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingHabitacion(null);
                    setNuevaHabitacion('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAsignarHabitacion(editingHabitacion)}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                >
                  Assign Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200">
        <p className="text-slate-500 text-sm font-bold">
          Showing {habitacionesOrdenadas.length} of {Object.keys(habitaciones).length} rooms
        </p>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
            1
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            2
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            3
          </button>
          <button className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Botón flotante de acción rápida */}
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform group relative">
          <Plus className="w-7 h-7" />
          <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            QUICK ASSIGN
          </span>
        </button>
      </div>
    </div>
  );
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
            onUpdateHabitacion={handleUpdateHabitacion}
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