'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, downloadExcel } from '@/src/services/api';
import { 
  LayoutDashboard, Package, BarChart3, Settings, Search, FileSpreadsheet, 
  Plus, Trash2, Edit, AlertTriangle, TrendingUp, Bell, ChevronDown, Filter, 
  ShieldCheck, ArrowUpRight, ArrowDownRight, RefreshCcw, History
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

export default function EnterpriseWMSDashboard() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // State untuk Recent Activities dinamis
  const [activities, setActivities] = useState([
    { type: 'Stock In', desc: 'Sistem diinisialisasi dari database PostgreSQL', time: 'Baru saja', icon: 'in' }
  ]);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    stock: '' as any,
    unit: 'Pcs',
    price: '' as any,
  });

  const chartData = [
    { date: '1 May', stockIn: 2400, stockOut: 1400 },
    { date: '6 May', stockIn: 3200, stockOut: 2100 },
    { date: '11 May', stockIn: 2800, stockOut: 1900 },
    { date: '16 May', stockIn: 4100, stockOut: 2800 },
    { date: '21 May', stockIn: 3700, stockOut: 2300 },
    { date: '24 May', stockIn: 4500, stockOut: 3100 },
  ];

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      if (data.length > 0 && !selectedProduct) {
        setSelectedProduct(data[0]);
      }
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
        // Tambahkan ke log aktivitas
        setActivities(prev => [
          { type: 'Stock Adjustment', desc: `SKU ${form.sku} (${form.name}) diperbarui`, time: 'Baru saja', icon: 'adj' },
          ...prev
        ]);
        setEditingId(null);
      } else {
        await addProduct(payload);
        toast.success('SKU baru berhasil ditambahkan!');
        // Tambahkan ke log aktivitas
        setActivities(prev => [
          { type: 'Stock In', desc: `${form.stock} ${form.unit} ditambahkan ke ${form.name}`, time: 'Baru saja', icon: 'in' },
          ...prev
        ]);
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
    const targetProduct: any = products.find((p: any) => p.id === id);
    if (confirm('Hapus SKU ini secara permanen?')) {
      try {
        await deleteProduct(id);
        toast.success('Produk dihapus dari sistem.');
        // Tambahkan ke log aktivitas
        setActivities(prev => [
          { type: 'Stock Out', desc: `Produk ${targetProduct?.name || ''} dihapus dari sistem`, time: 'Baru saja', icon: 'out' },
          ...prev
        ]);
        fetchProducts();
      } catch (error) {
        toast.error('Gagal menghapus produk.');
      }
    }
  };

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProductsCount = products.length;
  const totalStockValue = products.reduce((acc: number, item: any) => acc + (Number(item.stock) * Number(item.price)), 0);
  const lowStockItems = products.filter((p: any) => p.stock <= 5);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden text-xs">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden lg:flex select-none">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between px-2 pt-1 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">SaprilWMS</h2>
              <p className="text-[10px] text-blue-400 font-medium">WareHouse Inventory 543</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Manajemen Gudang</p>
            <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/15 text-blue-400 font-medium">
              <LayoutDashboard size={15} /> Dashboard Overview
            </a>
            <a href="inventory" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <Package size={15} /> Manajemen Inventory
            </a>
            <a href="inbound-outbound" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
              <BarChart3 size={15} /> Inbound & Outbound
            </a>
            <a href="audit" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition">
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
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari SKU, Nama Barang, atau Tag... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition">
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

        {/* CONTAINER DASHBOARD ANALITIK */}
        <div className="p-6 space-y-6 max-w-[1800px] mx-auto w-full">
          
          {/* WELCOME BANNER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-wide">Hi Sapril</h1>
              <p className="text-slate-400 mt-0.5">Berikut ringkasan operasional dan pergerakan stok gudang Anda hari ini.</p>
            </div>
            
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition shadow-md shadow-emerald-600/20"
              >
                <FileSpreadsheet size={16} /> Export Reports
              </button>
            </div>
          </div>

          {/* 4 KARTU METRIK UTAMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Products</span>
                <span className="p-2 bg-blue-600/10 text-blue-400 rounded-xl"><Package size={18} /></span>
              </div>
              <h3 className="text-3xl font-bold text-white">{totalProductsCount.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-400 flex items-center"><ArrowUpRight size={13} className="mr-0.5"/> SKU Aktif di Database</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Total Stock Value</span>
                <span className="p-2 bg-emerald-600/10 text-emerald-400 rounded-xl"><TrendingUp size={18} /></span>
              </div>
              <h3 className="text-2xl font-bold text-white">Rp {totalStockValue.toLocaleString('id-ID')}</h3>
              <p className="text-[10px] text-emerald-400 flex items-center"><ArrowUpRight size={13} className="mr-0.5"/> Valuasi Real-time</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Stock In (This Month)</span>
                <span className="p-2 bg-purple-600/10 text-purple-400 rounded-xl"><ArrowDownRight size={18} /></span>
              </div>
              <h3 className="text-3xl font-bold text-white">3,560</h3>
              <p className="text-[10px] text-emerald-400 flex items-center"><ArrowUpRight size={13} className="mr-0.5"/> +15.2% dari periode lalu</p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Out (This Month)</span>
                <span className="p-2 bg-amber-600/10 text-amber-400 rounded-xl"><ArrowUpRight size={18} /></span>
              </div>
              <h3 className="text-3xl font-bold text-white">2,450</h3>
              <p className="text-[10px] text-rose-400 flex items-center"><ArrowDownRight size={13} className="mr-0.5"/> -5.6% dari periode lalu</p>
            </div>

          </div>

          {/* GRID TENGAH: GRAFIK & RECENT ACTIVITIES DINAMIS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* GRAFIK STOCK OVERVIEW */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-sm text-white">Stock Overview</h2>
                  <p className="text-[11px] text-slate-400">Pergerakan arus barang masuk dan keluar gudang</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                  <span>This Month</span>
                  <ChevronDown size={12} />
                </div>
              </div>
              
              <div className="h-64 w-full bg-slate-950/40 rounded-xl border border-slate-800/80 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} 
                    />
                    <Line type="monotone" dataKey="stockIn" stroke="#3b82f6" strokeWidth={2} dot={false} name="Stock In" />
                    <Line type="monotone" dataKey="stockOut" stroke="#a855f7" strokeWidth={2} dot={false} name="Stock Out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RECENT ACTIVITIES DINAMIS MENGIKUTI DATA MASUK */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-4 space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-sm text-white mb-3">Recent Activities (Live Log)</h2>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {activities.map((act, index) => (
                    <div key={index} className="flex items-start gap-3 p-2.5 bg-slate-800/40 rounded-xl border border-slate-800/80">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${
                        act.icon === 'in' ? 'bg-emerald-500/10 text-emerald-400' :
                        act.icon === 'out' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {act.icon === 'in' ? <ArrowDownRight size={14}/> : act.icon === 'out' ? <ArrowUpRight size={14}/> : <History size={14}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-slate-200 truncate">{act.type}</p>
                          <span className="text-[9px] text-slate-500">{act.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{act.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button 
  onClick={() => setActivities([])}
  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-center text-xs font-medium transition"
>
  Clear Activity Logs
</button>
            </div>

          </div>

          {/* BAGIAN BAWAH: FORM & TABEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* FORM TAMBAH SKU */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-4 space-y-4">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Plus size={15} className="text-blue-500" />
                {editingId ? 'Edit Data SKU' : 'Tambah SKU Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">SKU / Kode Barang</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="Contoh: WH-1001"
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
                    placeholder="Contoh: Wireless Headphones"
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
                    placeholder="Rp."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition shadow-sm mt-2"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan ke Database'}
                </button>
              </form>
            </div>

            {/* TABEL INVENTORY */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 lg:col-span-8 overflow-x-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="font-bold text-slate-200">Low Stock Alerts & Inventory Table</h2>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-medium">
                  {lowStockItems.length} Items Need Attention
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Product Name</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold">Stock</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3.5 font-semibold text-white">{p.name}</td>
                        <td className="py-3.5 text-blue-400 font-mono">{p.sku}</td>
                        <td className="py-3.5 text-slate-200 font-medium">{p.stock} {p.unit}</td>
                        <td className="py-3.5 text-slate-300">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.stock <= 5 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {p.stock <= 5 ? 'Low' : 'Normal'}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button onClick={() => handleEdit(p)} className="p-1.5 bg-slate-800 hover:bg-blue-600/20 text-blue-400 rounded-lg transition" title="Edit">
                              <Edit size={13} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-slate-800 hover:bg-rose-600/20 text-rose-400 rounded-lg transition" title="Hapus">
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
  );
}