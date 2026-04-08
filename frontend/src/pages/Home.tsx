import { useEffect, useState } from 'react';
import api from '../services/api';

interface BackendResponse {
  message: string;
  status: string;
  databaseAvailable: string;
}

export function Home() {
  const [data, setData] = useState<BackendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<BackendResponse>('/home')
      .then(response => setData(response.data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6">
            Projeto Full Stack
          </h1>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Este é um projeto base configurado com React, Tailwind CSS e TypeScript no Frontend consumindo uma API Node.js e Express no Backend.
          </p>
          
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">
              Resposta da API
            </h2>
            
            {error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                <p className="font-mono text-sm">{error}</p>
                <p className="text-xs mt-2 opacity-80 mt-2">Certifique-se de que o backend está rodando na porta 3000.</p>
              </div>
            ) : !data ? (
              <div className="animate-pulse flex space-x-4 justify-center items-center py-4">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 uppercase font-bold">Mensagem</span>
                  <span className="text-emerald-400 font-mono bg-emerald-400/10 py-1 px-3 rounded inline-block w-fit">
                    {data.message}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 uppercase font-bold">Status</span>
                  <span className="text-blue-400 font-medium">
                    {data.status}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-slate-500 uppercase font-bold">Banco de Dados</span>
                  <span className="text-amber-400/90 text-sm italic">
                    {data.databaseAvailable}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-950 px-8 py-4 flex justify-between items-center border-t border-slate-800">
          <span className="text-xs text-slate-500">React + Vite + Tailwind 4</span>
          <span className="text-xs text-slate-500">Node.js + Express + MariaDB</span>
        </div>
      </div>
    </div>
  );
}
