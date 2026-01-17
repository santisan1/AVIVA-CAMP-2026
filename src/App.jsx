import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OrganizadorAuth from './OrganizadorAuth'; // ← CAMBIO AQUÍ
import AcampanteView from './AcampanteView';
import RoleSelector from './RoleSelector';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio - Selector de rol */}
        <Route path="/" element={<RoleSelector />} />

        {/* Vista del Organizador/Guía - AHORA CON AUTH */}
        <Route path="/organizador" element={<OrganizadorAuth />} />

        {/* Vista del Acampante */}
        <Route path="/acampante" element={<AcampanteView />} />

        {/* Redirect por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}