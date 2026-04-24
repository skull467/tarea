import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

export default function App() {
  const [ui, setUi] = useState({ scan: false, code: "", qty: "" });
  const [db, setDb] = useState([
    { id: 1, name: "Laptop Dell XPS 15", cb: "LPT-001", stock: 3, min: 5, cad: "2026-12-15" },
    { id: 2, name: "Mouse Inalámbrico", cb: "MSE-034", stock: 45, min: 20, cad: "2027-06-20" },
    { id: 3, name: "Teclado Mecánico RGB", cb: "TEC-019", stock: 2, min: 10, cad: "2026-11-30" }
  ]);

  const handleOp = (type) => {
    const q = parseInt(ui.qty);
    if (!ui.code || isNaN(q)) return alert("Error: Datos incompletos");
    setDb(db.map(p => p.cb === ui.code ? 
      (type === 'OUT' && p.stock - q < 0 ? (alert("CU-03: Stock insuficiente"), p) : { ...p, stock: type === 'IN' ? p.stock + q : p.stock - q }) 
      : p));
    setUi({ ...ui, code: "", qty: "", scan: false });
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#a1a1aa] font-sans">
      {/* Sidebar - Idéntico a la imagen profesional */}
      <aside className="w-64 border-r border-[#1e1e2e] p-6 hidden lg:block bg-[#09090b]">
        <div className="flex items-center gap-2 mb-10 text-white font-bold tracking-tighter">
          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center italic text-xs">I</div> ITCV INVENTARIO
        </div>
        <nav className="space-y-1">
          {['Dashboard', 'Inventario', 'Movimientos', 'Reportes', 'Ajustes'].map((m, i) => (
            <div key={m} className={`p-2 rounded-md text-sm cursor-pointer transition ${i === 0 ? 'bg-[#18181b] text-white' : 'hover:bg-[#111] hover:text-white'}`}>
              {m}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-xl font-bold text-white uppercase tracking-tight">Dashboard General</h1>
          <p className="text-xs text-[#71717a]">Ingeniería de Software • Equipo 1</p>
        </header>

        {/* Tarjetas de Métricas (Igual a tu imagen) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-[#71717a] text-[10px] font-bold uppercase mb-2">Stock Total <span>📦</span></div>
            <p className="text-2xl font-bold text-white">{db.reduce((a,b)=>a+b.stock,0)}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-[#71717a] text-[10px] font-bold uppercase mb-2">Productos <span>📈</span></div>
            <p className="text-2xl font-bold text-white">{db.length}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl border-red-900/30">
            <div className="flex justify-between items-start text-red-500 text-[10px] font-bold uppercase mb-2">Alertas <span>⚠️</span></div>
            <p className="text-2xl font-bold text-white">{db.filter(p=>p.stock<=p.min).length}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-purple-500 text-[10px] font-bold uppercase mb-2">Próximos <span>🕒</span></div>
            <p className="text-2xl font-bold text-white">8</p>
          </div>
        </div>

        {/* Panel de Registro Rápido */}
        <section className="bg-[#09090b] border border-[#1e1e2e] p-6 rounded-xl mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase">Scanner / Código de Barras</label>
              <div className="flex gap-2">
                <button onClick={()=>setUi({...ui, scan: !ui.scan})} className="bg-[#18181b] border border-[#27272a] text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition">📷</button>
                <input value={ui.code} onChange={e=>setUi({...ui, code: e.target.value})} placeholder="Escanea o escribe el código..." className="flex-1 bg-transparent border border-[#27272a] p-2 rounded-md text-white text-sm outline-none focus:border-red-600"/>
              </div>
            </div>
            <div className="w-full md:w-24 space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase">Cant.</label>
              <input type="number" value={ui.qty} onChange={e=>setUi({...ui, qty: e.target.value})} placeholder="0" className="w-full bg-transparent border border-[#27272a] p-2 rounded-md text-white text-sm outline-none"/>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={()=>handleOp('IN')} className="flex-1 md:w-28 bg-white text-black font-bold py-2 rounded-md text-sm hover:bg-zinc-200">ENTRADA</button>
              <button onClick={()=>handleOp('OUT')} className="flex-1 md:w-28 bg-[#18181b] border border-[#27272a] text-white font-bold py-2 rounded-md text-sm hover:text-red-500">SALIDA</button>
            </div>
          </div>
          {ui.scan && <div className="mt-4 max-w-sm mx-auto rounded-xl overflow-hidden border border-red-600 shadow-2xl">
            <BarcodeScannerComponent onUpdate={(e,r)=> r && setUi({...ui, code: r.text, scan: false})} />
          </div>}
        </section>

        {/* Tabla de Alertas (Diseño idéntico a la imagen) */}
        <div className="bg-[#09090b] border border-[#1e1e2e] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#1e1e2e] bg-[#111113]/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Alertas y Notificaciones</h3>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">ACTIVO</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#71717a] bg-[#09090b]">
                <tr className="border-b border-[#1e1e2e]">
                  <th className="p-4 font-medium uppercase">Producto</th>
                  <th className="p-4 font-medium uppercase">Stock</th>
                  <th className="p-4 font-medium uppercase">Caducidad</th>
                  <th className="p-4 font-medium uppercase text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {db.map(p => (
                  <tr key={p.id} className="border-b border-[#1e1e2e] hover:bg-[#18181b]/40 transition-colors text-white">
                    <td className="p-4">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-[10px] text-[#71717a] font-mono">{p.cb}</p>
                    </td>
                    <td className="p-4 font-black text-lg">{p.stock}</td>
                    <td className="p-4 text-[#71717a]">{p.cad}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black border ${p.stock <= p.min ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {p.stock <= p.min ? '⚠ STOCK BAJO' : '✓ NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}