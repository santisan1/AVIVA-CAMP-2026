import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AvivaApp from './AvivaApp'; // Tu vista de organizador actual
import AcampanteView from './AcampanteView'; // Nueva vista de acampante
import RoleSelector from './RoleSelector'; // Selector de roles (crear siguiente)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio - Selector de rol */}
        <Route path="/" element={<RoleSelector />} />

        {/* Vista del Organizador/Guía */}
        <Route path="/organizador" element={<AvivaApp />} />

        {/* Vista del Acampante */}
        <Route path="/acampante" element={<AcampanteView />} />

        {/* Redirect por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}