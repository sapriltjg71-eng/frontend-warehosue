'use client';

import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, downloadExcel } from '@/src/services/api';
import { 
  LayoutDashboard, Package, BarChart3, Settings, Search, FileSpreadsheet, 
  Plus, Trash2, Edit, AlertTriangle, TrendingUp, Bell, ChevronDown, Filter, 
  ShieldCheck, ArrowUpRight, RefreshCcw, Layers, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function InventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    stock: '' as any,
    unit: 'Pcs',
    price: '' as any,
  });

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal terhubung ke backend NestJS.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatIDR = (value: any) => {
    if (!value) return '';
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        stock: Number(form.stock),
        price: Number(form.price),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success('SKU berhasil diperbarui!');
        setEditingId(null);
      } else {
        await addProduct(payload);
        toast.success('SKU baru berhasil ditambahkan ke database!');
      }
      
      setForm({ sku: '', name: '', stock: '' as any, unit: 'Pcs', price: '' as any });
      fetchProducts();
    } catch (error) {
      toast.error('Gagal memproses data.');
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      stock: product.stock,
      unit: product.unit,
      price: product.price,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus SKU ini dari database secara permanen?')) {
      try {
        await deleteProduct(id);
        toast.success('Produk berhasil dihapus.');
        fetchProducts();
      } catch (error) {
        toast.error('Gagal menghapus produk.');
      }
    }
  };

  // Filter produk berdasarkan pencarian dan status stok
  const filteredProducts = products.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'Low') {
      return matchesSearch && p.stock <= 5;
    } else if (statusFilter === 'Normal') {
      return matchesSearch && p.stock > 5;
    }
    return matchesSearch;
  });

  const totalItemsCount = products.reduce((acc: number, item: any) => acc + Number(item.stock), 0);
  const totalValuation = products.reduce((acc: number, item: any) => acc + (Number(item.stock) * Number(item.price)), 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden text-xs">
      <Toaster position="top-right" />

      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden lg:flex select-none">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between px-2 pt-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">Sapril tjg</h2>
              <p className="text-[10px] text-blue-400 font-medium">WAREHOUSE INVENTORY</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Manajemen Gudang</p>
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <LayoutDashboard size={15} /> Dashboard Overview
            </Link>
            <Link href="/inventory" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-medium">
              <Package size={15} /> Manajemen Inventory
            </Link>
            <Link href="/inbound-outbound" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <BarChart3 size={15} /> Inbound & Outbound
            </Link>
            <a href="/audit" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <FileSpreadsheet size={15} /> Audit & Stock Opname
            </a>
          </div>
        </div>

        <div className="p-3 m-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Kapasitas Gudang</span>
            <span className="text-blue-400 font-semibold">82%</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[82%]"></div>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 w-1/3">
            <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition" title="Kembali ke Dashboard">
              <ArrowLeft size={15} />
            </Link>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari SKU atau Nama Barang di Inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchProducts} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition">
              <RefreshCcw size={13} /> Sinkronisasi
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                ST
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-200 text-xs">Sapril Tjg</p>
                <p className="text-[9px] text-slate-400">Lead Supervisor</p>
              </div>
            </div>
          </div>
        </header>

        {/* HALAMAN UTAMA INVENTORY */}
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
          
          {/* BANNER HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-medium text-[11px] mb-1">
                <Layers size={14} /> Master Data Management
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">Manajemen Inventory & SKU Gudang</h1>
              <p className="text-slate-400 mt-0.5">Kelola penuh seluruh data produk, tambah SKU baru, perbarui stok, dan kontrol tingkat ketersediaan.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition shadow-md shadow-emerald-600/20"
              >
                <FileSpreadsheet size={16} /> Export Master Data (.xlsx)
              </button>
            </div>
          </div>

          {/* KARTU RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Total Macam SKU</p>
              <h3 className="text-2xl font-bold text-white">{products.length} <span className="text-xs text-slate-400 font-normal">Jenis Barang</span></h3>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Akumulasi Unit Fisik</p>
              <h3 className="text-2xl font-bold text-blue-400">{totalItemsCount.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">Pcs/Unit</span></h3>
            </div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Total Valuasi Aset</p>
              <h3 className="text-2xl font-bold text-emerald-400">Rp {totalValuation.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          {/* KONTEN GRID: FORM DAN TABEL UTAMA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* FORM INPUT / EDIT SKU */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-4 h-fit space-y-4">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Plus size={15} className="text-blue-500" />
                {editingId ? 'Edit Data SKU Master' : 'Tambah SKU Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">SKU / Kode Barang</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="Contoh: INV-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Nama Barang</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Contoh: Inverter Motor"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Stok</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Satuan</label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      placeholder="Pcs"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Harga Satuan (IDR)</label>
                  <input
                    type="text"
                    value={form.price ? formatIDR(form.price) : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\./g, '');
                      setForm({ ...form, price: rawValue });
                    }}
                    placeholder="23.000.000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
                </div>

                <div className="pt-2 flex gap-2">
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm"
                >
                    {editingId ? 'Simpan Perubahan SKU' : 'Simpan ke Database'}
                </button>
                {editingId && (
                    <button
                    type="button"
                    onClick={() => {
                        setEditingId(null);
                        setForm({ sku: '', name: '', stock: '' as any, unit: 'Pcs', price: '' as any });
                      }}
                      className="bg-slate-800 hover:bg-slate-700 px-3 py-2.5 rounded-xl transition"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* TABEL MASTER INVENTORY */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-8 overflow-x-auto space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
                <h2 className="font-bold text-slate-200">Daftar Master Inventory SKU</h2>
                
                {/* FILTER STATUS */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                  {['All', 'Normal', 'Low'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                        statusFilter === st ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st === 'All' ? 'Semua' : st === 'Low' ? 'Stok Kritis' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">SKU & Nama Barang</th>
                    <th className="pb-3 font-semibold">Stok</th>
                    <th className="pb-3 font-semibold">Harga Satuan</th>
                    <th className="pb-3 font-semibold">Total Valuasi</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3.5">
                          <p className="font-semibold text-white">{p.name}</p>
                          <span className="text-[10px] text-blue-400 font-mono">{p.sku}</span>
                        </td>
                        <td className="py-3.5 font-medium text-slate-200">
                          {p.stock} <span className="text-slate-400">{p.unit}</span>
                        </td>
                        <td className="py-3.5 text-slate-300">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 font-semibold text-emerald-400">Rp {(Number(p.stock) * Number(p.price)).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.stock <= 5 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {p.stock <= 5 ? 'Kritis' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600/20 text-blue-400 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-600/20 text-rose-400 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500">
                        Tidak ada data produk ditemukan di database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}