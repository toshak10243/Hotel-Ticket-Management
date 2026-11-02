import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ExternalLink, Bed } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const QrGeneratorPage = () => {
  const [roomNumber, setRoomNumber] = useState('101');
  const [protocolAndHost] = useState(window.location.origin);

  const qrUrl = `${protocolAndHost}/guest/request?room=${encodeURIComponent(roomNumber)}`;

  const popularRooms = ['101', '102', '201', '204', '305', '401', '502'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Room QR Standee Generator
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hotel Room QR Code Configuration
        </h1>
        <p className="mt-1 text-slate-600 text-sm">
          Print or display this QR code in individual guest rooms. When guests scan this code with their smartphone camera, the request form automatically opens with the room number pre-populated.
        </p>

        {/* Input Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Target Room Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 101"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Bed className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Quick Pick Room
            </label>
            <div className="flex flex-wrap gap-2">
              {popularRooms.map((rm) => (
                <button
                  key={rm}
                  type="button"
                  onClick={() => setRoomNumber(rm)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    roomNumber === rm
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Room {rm}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Printable Card Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Printable Standee Preview */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center mb-3 shadow-xs p-1">
            <img src={logoImg} alt="Hotel Arya Niwas Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Hotel Arya Niwas</h2>
          <p className="text-xs text-slate-500 font-medium">Guest Service & Maintenance</p>

          <div className="mt-3 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            Room {roomNumber || '---'}
          </div>

          <div className="mt-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <QRCodeSVG
              id="room-qr-svg"
              value={qrUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="mt-4 text-xs text-slate-500 font-medium max-w-xs">
            Scan with any phone camera to request housekeeping, room service, or report an issue.
          </p>
        </div>

        {/* URL and Testing Information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2">QR Code Destination Link</h3>
            <p className="text-xs text-slate-500 mb-4">
              This is the exact deep-link encoded in the QR code:
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono break-all text-slate-700 select-all">
              {qrUrl}
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                How It Works:
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>Hotel places the printable standee in Room {roomNumber}.</li>
                <li>The guest points their smartphone camera at the QR code.</li>
                <li>The browser automatically opens the service request portal.</li>
                <li>Room {roomNumber} is pre-populated in the form.</li>
                <li>The guest submits their request or complaint without login.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
            <a
              href={qrUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test Scan / Open Link Directly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
