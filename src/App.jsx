import React, { useMemo, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const CODE_PATTERN = /^[A-Z0-9-]{3,24}$/;
const MAX_QTY_PER_OPERATION = 1000;

const INITIAL_INVENTORY = [
  { id: 1, name: 'Laptop Dell XPS 15', cb: 'LPT-001', stock: 3, min: 5, cad: '2026-12-15' },
  { id: 2, name: 'Mouse Inalámbrico', cb: 'MSE-034', stock: 45, min: 20, cad: '2027-06-20' },
  { id: 3, name: 'Teclado Mecánico RGB', cb: 'TEC-019', stock: 2, min: 10, cad: '2026-11-30' },
];

function normalizeCode(rawCode = '') {
  return rawCode.trim().toUpperCase();
}

function validateOperation(code, qtyRaw) {
  const qty = Number.parseInt(String(qtyRaw), 10);

  if (!code || Number.isNaN(qty)) {
    return { ok: false, message: 'Error: Datos incompletos.' };
  }

  if (!CODE_PATTERN.test(code)) {
    return { ok: false, message: 'CU-01: Formato de código inválido.' };
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    return { ok: false, message: 'CU-02: La cantidad debe ser un entero positivo.' };
  }

  if (qty > MAX_QTY_PER_OPERATION) {
    return { ok: false, message: `CU-04: Máximo permitido por movimiento: ${MAX_QTY_PER_OPERATION}.` };
  }

  return { ok: true, qty };
}

export default function App() {
  const [ui, setUi] = useState({ scan: false, code: '', qty: '', message: '' });
  const [db, setDb] = useState(INITIAL_INVENTORY);

  const totals = useMemo(
    () => ({
      stock: db.reduce((acc, item) => acc + item.stock, 0),
      alerts: db.filter((item) => item.stock <= item.min).length,
    }),
    [db],
  );

  const resetForm = (message = '') => {
    setUi((prev) => ({ ...prev, code: '', qty: '', scan: false, message }));
  };

  const handleOp = (type) => {
    const code = normalizeCode(ui.code);
    const validation = validateOperation(code, ui.qty);

    if (!validation.ok) {
      resetForm(validation.message);
      return;
    }

    let resultMessage = 'Movimiento registrado correctamente.';

    setDb((prevDb) => {
      const existing = prevDb.find((product) => product.cb === code);

      if (!existing) {
        resultMessage = 'CU-05: El código no existe en inventario.';
        return prevDb;
      }

      if (type === 'OUT' && existing.stock - validation.qty < 0) {
        resultMessage = 'CU-03: Stock insuficiente.';
        return prevDb;
      }

      return prevDb.map((product) =>
        product.cb === code
          ? {
              ...product,
              stock: type === 'IN' ? product.stock + validation.qty : product.stock - validation.qty,
            }
          : product,
      );
    });

    resetForm(resultMessage);
  };

  const onScanUpdate = (_error, result) => {
    if (!result?.text) return;
    const scannedCode = normalizeCode(result.text);
    setUi((prev) => ({ ...prev, code: scannedCode, scan: false, message: '' }));
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#a1a1aa] font-sans">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-[#71717a] text-[10px] font-bold uppercase mb-2">Stock Total <span>📦</span></div>
            <p className="text-2xl font-bold text-white">{totals.stock}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-[#71717a] text-[10px] font-bold uppercase mb-2">Productos <span>📈</span></div>
            <p className="text-2xl font-bold text-white">{db.length}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl border-red-900/30">
            <div className="flex justify-between items-start text-red-500 text-[10px] font-bold uppercase mb-2">Alertas <span>⚠️</span></div>
            <p className="text-2xl font-bold text-white">{totals.alerts}</p>
          </div>
          <div className="bg-[#09090b] border border-[#1e1e2e] p-5 rounded-xl">
            <div className="flex justify-between items-start text-purple-500 text-[10px] font-bold uppercase mb-2">Próximos <span>🕒</span></div>
            <p className="text-2xl font-bold text-white">8</p>
          </div>
        </div>

        <section className="bg-[#09090b] border border-[#1e1e2e] p-6 rounded-xl mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase">Scanner / Código de Barras</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUi((prev) => ({ ...prev, scan: !prev.scan, message: '' }))}
                  className="bg-[#18181b] border border-[#27272a] text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition"
                >
                  📷
                </button>
                <input
                  value={ui.code}
                  onChange={(e) => setUi((prev) => ({ ...prev, code: e.target.value, message: '' }))}
                  placeholder="Escanea o escribe el código..."
                  className="flex-1 bg-transparent border border-[#27272a] p-2 rounded-md text-white text-sm outline-none focus:border-red-600"
                  maxLength={24}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="w-full md:w-24 space-y-2">
              <label className="text-[10px] font-bold text-[#71717a] uppercase">Cant.</label>
              <input
                type="number"
                value={ui.qty}
                onChange={(e) => setUi((prev) => ({ ...prev, qty: e.target.value, message: '' }))}
                placeholder="0"
                className="w-full bg-transparent border border-[#27272a] p-2 rounded-md text-white text-sm outline-none"
                min={1}
                max={MAX_QTY_PER_OPERATION}
                step={1}
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => handleOp('IN')} className="flex-1 md:w-28 bg-white text-black font-bold py-2 rounded-md text-sm hover:bg-zinc-200">ENTRADA</button>
              <button onClick={() => handleOp('OUT')} className="flex-1 md:w-28 bg-[#18181b] border border-[#27272a] text-white font-bold py-2 rounded-md text-sm hover:text-red-500">SALIDA</button>
            </div>
          </div>

          {ui.message && (
            <p className="mt-4 text-xs font-semibold text-[#f4f4f5] bg-[#18181b] border border-[#27272a] rounded-md p-2" role="status" aria-live="polite">
              {ui.message}
            </p>
          )}

          {ui.scan && (
            <div className="mt-4 max-w-sm mx-auto rounded-xl overflow-hidden border border-red-600 shadow-2xl">
              <BarcodeScannerComponent onUpdate={onScanUpdate} />
            </div>
          )}
        </section>

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
                {db.map((p) => (
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
