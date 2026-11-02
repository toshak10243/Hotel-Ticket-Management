import React from 'react';
import { Outlet } from 'react-router-dom';
import { GuestNavbar } from '../components/GuestNavbar';

export const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <GuestNavbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-600">Hotel Arya Niwas &bull; Jaipur, Rajasthan</p>
        <p className="mt-1">QR-Based Hotel Service Request & Complaint Management System</p>
      </footer>
    </div>
  );
};

