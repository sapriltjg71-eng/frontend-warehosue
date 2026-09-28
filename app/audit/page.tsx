'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, BarChart3, FileSpreadsheet, 
  Plus, ArrowLeft, ShieldCheck, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { getAuditRecords, addAuditRecord, clearAuditRecords } from '@/src/services/api';

export default function AuditPage() {
  const [filterStatus, setFilterStatus] = useState('All');

  // State daftar data audit dari database PostgreSQL
  const [audits, setAudits] = useState<any[]>([]);

  // State form input stock opname baru
  const [form, setForm] = useState({
    auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
    sku: '',
    itemName: '',
    systemQty: '',
    physicalQty: '',
    auditor: '',
  });

  // Ambil data dari database saat halaman pertama kali dibuka
  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    const data = await getAuditRecords();
    setAudits(data);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sys = Number(form.systemQty || 0);
      const phy = Number(form.physicalQty || 0);
      const variance = phy - sys;
      
      let status = 'Match';
      if (variance < 0) status = 'Discrepancy';
      if (variance > 0) status = 'Surplus';

      const payload = {
        auditId: form.auditId,
        sku: form.sku || 'SKU-GEN-001',
        itemName: form.itemName || 'General Inventory Item',
        systemQty: sys,
        physicalQty: phy,
        variance: variance,
        auditor: form.auditor,
        status: status,
      };

      // Simpan permanen ke database PostgreSQL via NestJS
      const savedAudit = await addAuditRecord(payload);

      setAudits([savedAudit, ...audits]);
      setForm({
        auditId: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: '',
        itemName: '',
        systemQty: '',
        physicalQty: '',
        auditor: 'Sapril Tjg',
      });

      toast.success('Stock Opname berhasil disimpan ke database PostgreSQL!');
    } catch (error) {
      toast.error('Gagal menyimpan data audit ke backend.');
    }
  };

  // Fungsi untuk membersihkan seluruh data audit dari database
  const handleClearAudit = async () => {
    const success = await clearAuditRecords();
    if (success) {
      setAudits([]);
      toast.success('Semua data audit berhasil dibersihkan dari database.');
    } else {
      toast.error('Gagal membersihkan data audit.');
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
              <h2 className="font-bold text-sm tracking-wide text-white">Sapril Tjg</h2>
              <p className="text-[10px] text-blue-400 font-medium">Warehouse Supervisor</p>
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
            <Link href="/inbound-outbound" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <BarChart3 size={15} /> Inbound & Outbound
            </Link>
            <Link href="/audit" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-medium">
              <FileSpreadsheet size={15} /> Audit & Stock Opname
            </Link>
          </div>
        </div>

        <div className="p-3 m-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Audit Readiness</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 99.4% Accurate</span>
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
                <span>DC JKT-04</span> / <span>Compliance</span> / <span className="text-blue-400 font-medium">Audit & Stock Opname</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition text-xs font-medium">
              <FileSpreadsheet size={13} /> Export Audit Report
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                ST
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-200 text-xs">Sapril Tjg</p>
                <p className="text-[9px] text-slate-400">Lead Auditor</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER HALAMAN */}
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
          
          {/* BANNER HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                Audit & Stock Opname Control
                <span className="text-[10px] font-normal bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified Cycle Count
                </span>
              </h1>
              <p className="text-slate-400 mt-0.5">Rekonsiliasi stok fisik gudang dengan data sistem secara berkala untuk meminimalisir selisih.</p>
            </div>
          </div>

          {/* GRID UTAMA: FORM INPUT OPNAME & TABEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SISI KIRI: FORM OPNAME */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-4 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Plus size={15} className="text-blue-500" />
                  Record New Stock Count
                </h2>
              </div>

              <form onSubmit={handleAuditSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Audit Batch ID</label>
                  <input
                    type="text"
                    value={form.auditId}
                    onChange={(e) => setForm({ ...form, auditId: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="Contoh: SKU-HYD-8821"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    required
                    placeholder="Contoh: Hydraulic Valve"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">System Qty</label>
                    <input
                      type="number"
                      value={form.systemQty}
                      onChange={(e) => setForm({ ...form, systemQty: e.target.value })}
                      required
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Physical Qty</label>
                    <input
                      type="number"
                      value={form.physicalQty}
                      onChange={(e) => setForm({ ...form, physicalQty: e.target.value })}
                      required
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Lead Auditor</label>
                  <input
                    type="text"
                    value={form.auditor}
                    onChange={(e) => setForm({ ...form, auditor: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-md shadow-blue-600/20 mt-2"
                >
                  Verify & Submit Count
                </button>
              </form>
            </div>

            {/* SISI KANAN: TABEL HASIL AUDIT */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-8 overflow-x-auto space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                <div>
                  <h2 className="font-bold text-slate-200">Stock Opname Reconciliation Matrix (PostgreSQL)</h2>
                  <p className="text-[10px] text-slate-400">Data rekonsiliasi tersimpan permanen di database</p>
                </div>

                {/* FILTER STATUS */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  {['All', 'Match', 'Discrepancy', 'Surplus'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-medium transition ${
                        filterStatus === st ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
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
                    <th className="pb-3 font-semibold">Audit ID</th>
                    <th className="pb-3 font-semibold">SKU / Item</th>
                    <th className="pb-3 font-semibold text-center">System</th>
                    <th className="pb-3 font-semibold text-center">Physical</th>
                    <th className="pb-3 font-semibold text-center">Variance</th>
                    <th className="pb-3 font-semibold">Auditor</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {audits.length > 0 ? (
                    audits
                      .filter(item => filterStatus === 'All' || item.status === filterStatus)
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50 transition">
                          <td className="py-3.5 font-mono text-blue-400 font-semibold">{item.auditId}</td>
                          <td className="py-3.5">
                            <p className="font-medium text-white">{item.itemName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                          </td>
                          <td className="py-3.5 text-center font-mono text-slate-300">{item.systemQty}</td>
                          <td className="py-3.5 text-center font-mono text-white font-semibold">{item.physicalQty}</td>
                          <td className={`py-3.5 text-center font-mono font-bold ${
                            item.variance < 0 ? 'text-red-400' : item.variance > 0 ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            {item.variance > 0 ? `+${item.variance}` : item.variance}
                          </td>
                          <td className="py-3.5 text-slate-300">{item.auditor}</td>
                          <td className="py-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'Match' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              item.status === 'Discrepancy' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-500">
                        Belum ada data audit tersimpan di database. Silakan input melalui form di sebelah kiri.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* TOMBOL CLEAR AUDIT RECORDS */}
              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={handleClearAudit}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-center text-xs font-medium transition"
                >
                  Clear Audit Records (Database)
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}