'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, BarChart3, Settings, Search, FileSpreadsheet, 
  Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, Layers, ArrowLeft, 
  Printer, Radio, CheckCircle2, Clock, Truck, ShieldAlert, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { 
  getLogisticsTransactions, 
  addLogisticsTransaction, 
  clearLogisticsTransactions 
} from '@/src/services/api';

export default function InboundOutboundPage() {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // State form input transaksi baru
  const [form, setForm] = useState({
    refNo: '',
    entity: '',
    sku: '',
    qty: '',
    weight: '',
    location: '',
    status: 'Completed'
  });

  // State daftar transaksi live log dari database PostgreSQL
  const [transactions, setTransactions] = useState<any[]>([]);

  // Ambil data dari database saat halaman pertama kali dibuka
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const data = await getLogisticsTransactions();
    setTransactions(data);
  };

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        refNo: form.refNo || (activeTab === 'inbound' ? 'PO-99102' : 'DO-88120'),
        type: activeTab === 'inbound' ? 'Inbound' : 'Outbound',
        entity: form.entity || 'General Partner',
        sku: form.sku || 'General Cargo Item',
        qty: Number(form.qty || 0),
        weight: form.weight || '0 kg',
        location: form.location || 'Dock-A',
        status: form.status
      };

      // Simpan permanen ke database PostgreSQL via backend NestJS
      const savedTx = await addLogisticsTransaction(payload);
      
      // Update state tabel secara reaktif
      setTransactions([savedTx, ...transactions]);
      
      // Reset form agar kembali kosong
      setForm({
        refNo: '',
        entity: '',
        sku: '',
        qty: '',
        weight: '',
        location: '',
        status: 'Completed'
      });

      toast.success(`Log ${activeTab.toUpperCase()} berhasil disimpan ke database PostgreSQL!`);
    } catch (error) {
      toast.error('Gagal menyimpan ke database backend.');
    }
  };

  const handleClearLogs = async () => {
    const success = await clearLogisticsTransactions();
    if (success) {
      setTransactions([]);
      toast.success('Semua log transaksi berhasil dibersihkan dari database.');
    } else {
      toast.error('Gagal membersihkan log.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden text-xs">
      <Toaster position="top-right" />

      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden lg:flex select-none">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between px-2 pt-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">Sapriltjg</h2>
              <p className="text-[10px] text-blue-400 font-medium">WAREHOUSE INVENTORY</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Manajemen Gudang</p>
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <LayoutDashboard size={15} /> Dashboard Overview
            </Link>
            <Link href="/inventory" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <Package size={15} /> Manajemen Inventory
            </Link>
            <Link href="/inbound-outbound" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-medium">
              <BarChart3 size={15} /> Inbound & Outbound
            </Link>
            <a href="/audit" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <FileSpreadsheet size={15} /> Audit & Stock Opname
            </a>
          </div>
        </div>

        <div className="p-3 m-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Dock Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Bay A-D Active</span>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition" title="Kembali ke Dashboard">
              <ArrowLeft size={15} />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>DC JKT-04</span> / <span>Operations</span> / <span className="text-blue-400 font-medium">Inbound & Outbound Logistics</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition text-xs font-medium">
              <FileSpreadsheet size={13} /> Export Ledger (CSV)
            </button>
            <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition text-xs font-medium">
              <Printer size={13} /> Print Barcode
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                ST
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-200 text-xs">Sapril Tjg</p>
                <p className="text-[9px] text-slate-400">Shift: Morning Alpha</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER HALAMAN */}
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
          
          {/* HEADER BANNER & SHIFT */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                Inbound & Outbound Logistics 
                <span className="text-[10px] font-normal bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={11} /> Shift: Morning Alpha (07:00 - 16:00)
                </span>
              </h1>
              <p className="text-slate-400 mt-0.5">Monitoring dermaga bongkar muat secara real-time dan pencatatan manifest kargo barang ke PostgreSQL.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Bay Zone A-D Active
              </span>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('inbound')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  activeTab === 'inbound' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight size={15} /> Inbound (Supplier Receipts)
              </button>
              <button
                onClick={() => setActiveTab('outbound')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  activeTab === 'outbound' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight size={15} /> Outbound (Customer Dispatches)
              </button>
            </div>
            
            <div className="hidden md:flex items-center gap-3 px-3 text-slate-400 text-[11px]">
              <span>Database Connection: <strong className="text-emerald-400">PostgreSQL Active</strong></span>
            </div>
          </div>

          {/* KONTEN UTAMA: FORM LOG & TABEL MATRIKS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SISI KIRI: FORM LOG TRANSAKSI BARU */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Plus size={15} className="text-blue-500" />
                  Log New {activeTab === 'inbound' ? 'Inbound' : 'Outbound'} Transaction
                </h2>
              </div>

              <form onSubmit={handleCommit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    {activeTab === 'inbound' ? 'Reference / PO Number' : 'Delivery Order / DO No.'}
                  </label>
                  <input
                    type="text"
                    value={form.refNo}
                    onChange={(e) => setForm({ ...form, refNo: e.target.value })}
                    required
                    placeholder="Contoh: PO-99102"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    {activeTab === 'inbound' ? 'Vendor / Consignor Entity' : 'Destination Customer / Hub'}
                  </label>
                  <input
                    type="text"
                    value={form.entity}
                    onChange={(e) => setForm({ ...form, entity: e.target.value })}
                    required
                    placeholder="Contoh: PT Astra Logistik"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Target SKU & Component</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="Contoh: SKU-HYD-8821"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Quantity Units</label>
                    <input
                      type="number"
                      value={form.qty}
                      onChange={(e) => setForm({ ...form, qty: e.target.value })}
                      required
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Gross Weight</label>
                    <input
                      type="text"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="0 kg"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Storage Bin / Dock Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Contoh: Bin A-14-R3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-medium py-2.5 rounded-xl transition shadow-md mt-2 ${
                    activeTab === 'inbound' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  }`}
                >
                  Commit to WMS Database
                </button>
              </form>
            </div>

            {/* SISI KANAN: TABEL MATRIKS TRANSAKSI & TOMBOL CLEAR */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-8 overflow-x-auto space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                  <div>
                    <h2 className="font-bold text-slate-200">Live Logistics Transactions Matrix (PostgreSQL)</h2>
                    <p className="text-[10px] text-slate-400">Data tersimpan secara permanen di database</p>
                  </div>
                  
                  {/* FILTER STATUS */}
                  <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                    {['All', 'Pending QC', 'Completed', 'In Transit'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-medium transition ${
                          statusFilter === st ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <table className="w-full text-left border-collapse mt-3">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Ref No.</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Item & SKU Identifier</th>
                      <th className="pb-3 font-semibold">Qty / Load</th>
                      <th className="pb-3 font-semibold">Entity / Destination</th>
                      <th className="pb-3 font-semibold text-center">Status Gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.length > 0 ? (
                      transactions
                        .filter(tx => statusFilter === 'All' || tx.status === statusFilter)
                        .map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition">
                            <td className="py-3.5 font-mono text-blue-400 font-semibold">{tx.refNo}</td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                tx.type === 'Inbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3.5 font-medium text-white">{tx.sku}</td>
                            <td className="py-3.5 text-slate-300 font-mono">{tx.qty} Units</td>
                            <td className="py-3.5 text-slate-300">{tx.entity}</td>
                            <td className="py-3.5 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                                tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                tx.status === 'Pending QC' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-500">
                          Belum ada transaksi logistik di database. Silakan input melalui form di sebelah kiri.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={handleClearLogs}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-center text-xs font-medium transition"
                >
                  Clear Activity Logs (Database)
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}