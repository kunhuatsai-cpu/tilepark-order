import React, { useState, useEffect } from 'react';

// 🛑 您的 Google Script 網址
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyq0KVfpLLIzRUJ5w_rFqZq4C8p97LJOGAU5OkWwts1012zB6-sJIehrtyNLjXepfm5/exec";

// --- 🛠️ 內建 SVG 圖示 (完全不依賴外部套件，確保載入即顯示) ---
const IconWrapper = ({ children, size = 20, className = "", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

const Icons = {
  Bag: (p) => <IconWrapper {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></IconWrapper>,
  Truck: (p) => <IconWrapper {...p}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></IconWrapper>,
  User: (p) => <IconWrapper {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconWrapper>,
  Plus: (p) => <IconWrapper {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconWrapper>,
  Trash: (p) => <IconWrapper {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconWrapper>,
  Check: (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconWrapper>,
  Pin: (p) => <IconWrapper {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></IconWrapper>,
  Phone: (p) => <IconWrapper {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></IconWrapper>,
  Next: (p) => <IconWrapper {...p}><path d="m9 18 6-6-6-6"/></IconWrapper>,
  Copy: (p) => <IconWrapper {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></IconWrapper>
};

// --- Components ---

const Logo = () => (
  <div className="flex flex-col items-center justify-center p-2 md:p-4">
    <img 
      src="https://lh3.googleusercontent.com/d/1N9nrujoaGkFpdGhsBRgOs_WE-RgQEhU2" 
      alt="TILE PARK" 
      className="w-48 md:w-64 lg:w-72 object-contain transition-all hover:scale-105"
      style={{ maxWidth: '260px', height: 'auto' }} 
    />
  </div>
);

const Modal = ({ message, onClose, type = 'success' }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-6 backdrop-blur-md animate-fade-in">
    <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-pop-in">
      <div className={`p-8 text-center ${type === 'success' ? 'bg-green-50' : 'bg-orange-50'}`}>
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#c25e00]'}`}>
          {type === 'success' ? <Icons.Check size={28} /> : <Icons.Check size={28} />}
        </div>
        <div className="text-gray-800 font-bold text-lg mb-2 whitespace-pre-wrap">{message}</div>
      </div>
      <button onClick={onClose} className="w-full py-5 bg-[#222] text-white font-bold tracking-widest active:bg-black transition-colors">確定</button>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-5 mt-2 px-1">
    <div className="p-2.5 bg-orange-100 rounded-xl text-[#c25e00]">
      <Icon size={20} />
    </div>
    <h3 className="font-black text-gray-800 text-base md:text-lg tracking-widest">{title}</h3>
  </div>
);

export default function App() {
  const [styleLoaded, setStyleLoaded] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    if (!document.querySelector('script[src*="tailwindcss"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => setStyleLoaded(true);
      document.head.appendChild(script);
    } else {
      setStyleLoaded(true);
    }
  }, []);

  const [items, setItems] = useState([{ id: 1, name: '', qty: '', note: '' }]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [modalData, setModalData] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    orderType: '新案場',
    deliveryDate: today, 
    deliveryTime: '上午 (09-12)',
    deliveryContact: '', 
    deliveryPhone: '', 
    deliveryAddress: '',
    orderCompany: '', 
    orderContact: '', 
    orderPhone: '',
  });

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: '', note: '' }]);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newOrderId = `TILE-${new Date().toISOString().slice(5,10).replace('-','')}${Math.floor(1000 + Math.random() * 9000)}`;
    const submitData = { orderId: newOrderId, items, ...formData, timestamp: new Date().toLocaleString() };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      setOrderId(newOrderId);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setModalData({ msg: "系統忙碌中，請稍後再試或聯繫客服。", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyOrder = () => {
    const itemsList = items.map((it, idx) => `${idx + 1}. ${it.name} x ${it.qty} (${it.note || '無備註'})`).join('\n');
    const text = `【Tile Park 訂單通知】\n單號：${orderId}\n類型：${formData.orderType}\n公司：${formData.orderCompany}\n\n訂購內容：\n${itemsList}\n\n送貨日期：${formData.deliveryDate}\n時段：${formData.deliveryTime}\n地址：${formData.deliveryAddress}\n\n請協助確認庫存，謝謝！`;
    
    const fallbackCopy = (content) => {
        const ta = document.createElement("textarea"); 
        ta.value = content; 
        document.body.appendChild(ta); 
        ta.select();
        try { 
          document.execCommand('copy'); 
          setModalData({ msg: "✅ 訂單資訊已複製到剪貼簿！", type: 'success' }); 
        } catch (err) { 
          setModalData({ msg: "❌ 複製失敗，請手動截圖", type: 'error' }); 
        }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) { 
      navigator.clipboard.writeText(text)
        .then(() => setModalData({ msg: "✅ 訂單資訊已複製到剪貼簿！", type: 'success' }))
        .catch(() => fallbackCopy(text)); 
    } else { 
      fallbackCopy(text); 
    }
  };

  if (!styleLoaded) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#c25e00] rounded-full animate-spin mb-4"></div>
        <div className="text-[10px] text-gray-400 tracking-[0.3em] font-bold">TILE PARK SYSTEM</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 animate-fade-in">
        {modalData && <Modal message={modalData.msg} type={modalData.type} onClose={() => setModalData(null)} />}
        
        <div className="bg-white w-full max-w-sm shadow-2xl rounded-3xl overflow-hidden mb-8 relative border border-gray-100">
          <div className="h-2.5 bg-[#c25e00] w-full"></div>
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-green-50">
              <Icons.Check size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">訂單已成功送出</h2>
            <p className="font-mono text-base text-[#c25e00] font-bold mb-8 tracking-widest uppercase">ID: {orderId}</p>

            <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 border border-gray-100">
               <div className="flex justify-between text-sm md:text-base"><span className="text-gray-400">訂購公司</span><span className="font-bold">{formData.orderCompany}</span></div>
               <div className="flex justify-between text-sm md:text-base"><span className="text-gray-400">送貨日期</span><span className="font-bold">{formData.deliveryDate}</span></div>
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
           <button onClick={copyOrder} className="w-full bg-[#222] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all text-lg group">
             <Icons.Copy size={22} className="group-hover:scale-110 transition-transform" /> 複製訂單內容
           </button>
           
           <a href="https://line.me/ti/p/@tileparktw" target="_blank" rel="noreferrer" className="w-full bg-[#06C755] text-white py-5 rounded-2xl font-black tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-lg">
             前往 LINE 確認庫存
           </a>
           <button onClick={() => window.location.reload()} className="w-full py-4 text-sm text-gray-400 font-bold tracking-widest uppercase hover:text-gray-600 transition-colors">返回首頁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 selection:bg-[#c25e00] selection:text-white overflow-x-hidden">
      {modalData && <Modal message={modalData.msg} type={modalData.type} onClose={() => setModalData(null)} />}

      <div className="w-full max-w-7xl mx-auto md:flex md:shadow-2xl md:min-h-screen bg-white md:overflow-hidden">
        
        {/* --- 左側：品牌資訊欄 (優化：手機版與電腦版皆為靠上對齊，確保一上一下佈局) --- */}
        <aside className="w-full md:w-[30%] lg:w-[25%] bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center justify-start p-8 md:p-12 pt-10 md:pt-20 lg:pt-24 relative shrink-0">
           <Logo />
           
           {/* 金色分隔線：手機版調小，電腦版保持 */}
           <div className="w-12 md:w-16 h-1 bg-[#c25e00] my-6 md:my-10 rounded-full"></div>
           
           <div className="text-center space-y-5">
              {/* 公司抬頭：確保緊隨在 LOGO 下方 */}
              <h2 className="text-xl md:text-2xl font-black tracking-[0.2em] text-gray-900 leading-tight">薩鉅國際有限公司</h2>
              
              <div className="text-xs md:text-sm text-gray-400 leading-relaxed space-y-4 font-medium">
                 <p className="flex items-center justify-center gap-2 hover:text-gray-600 transition-colors cursor-default">
                    <Icons.Pin size={14}/> 新北市板橋區金門街215巷78-5號
                 </p>
                 <p className="flex items-center justify-center gap-2 hover:text-[#c25e00] transition-colors font-bold text-gray-600">
                    <Icons.Phone size={14}/> 02-86860028
                 </p>
              </div>
           </div>
           
           <div className="hidden md:block absolute bottom-10 text-xs text-gray-300 font-serif tracking-[0.5em] uppercase">Authentic Japanese Tiles</div>
        </aside>

        {/* --- 右側：表單操作區 --- */}
        <main className="flex-1 bg-gray-50 md:overflow-y-auto custom-scrollbar relative">
          <form onSubmit={handleSubmit} className="p-4 md:p-10 lg:p-16 max-w-4xl mx-auto pb-32 md:pb-24">
            <div className="bg-gray-200/50 p-2 rounded-2xl flex mb-12 shadow-inner">
              {['新案場', '案場追加訂單'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, orderType: type})}
                  className={`flex-1 py-4 text-base md:text-lg font-black rounded-xl transition-all duration-300 ${
                    formData.orderType === type 
                      ? 'bg-white text-[#c25e00] shadow-md scale-100' 
                      : 'text-gray-400 hover:text-gray-600 scale-95 opacity-70'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-16">
              <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <SectionHeader icon={Icons.Bag} title="訂購內容清單" />
                <div className="space-y-5">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
                      <div className="absolute top-0 right-0 bg-gray-100 text-[11px] px-4 py-2 rounded-bl-2xl text-gray-400 font-mono font-bold uppercase tracking-tighter">ITEM {index + 1}</div>
                      <div className="space-y-6">
                        <div className="w-full">
                          <label className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-widest mb-2 block">產品型號 / 品名</label>
                          <input required className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-lg md:text-xl font-bold focus:ring-2 focus:ring-[#c25e00]/20 outline-none transition-all placeholder:text-gray-200"
                            placeholder="請輸入磁磚型號" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                        </div>
                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex-[2]">
                            <label className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-widest mb-2 block">數量 (片/才)</label>
                            <input required className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-lg md:text-xl font-bold text-center focus:ring-2 focus:ring-[#c25e00]/20 outline-none transition-all"
                              placeholder="0" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} />
                          </div>
                          <div className="flex-[3]">
                            <label className="text-xs md:text-sm text-gray-400 font-black uppercase tracking-widest mb-2 block">備註說明</label>
                            <input className="w-full bg-gray-50 border-none rounded-xl px-5 py-4 text-lg md:text-xl font-medium focus:ring-2 focus:ring-[#c25e00]/20 outline-none transition-all placeholder:text-gray-200"
                              placeholder="批號或區域" value={item.note} onChange={e => updateItem(item.id, 'note', e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} className="absolute -left-3 -top-3 bg-white text-red-400 shadow-lg rounded-full p-2.5 border border-red-50 hover:bg-red-50 active:scale-90 transition-all">
                          <Icons.Trash size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="w-full py-5 border-2 border-dashed border-gray-200 text-gray-400 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:border-[#c25e00] hover:text-[#c25e00] hover:bg-white transition-all active:scale-[0.98]">
                    <Icons.Plus size={24} /> 新增訂購品項
                  </button>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <SectionHeader icon={Icons.Truck} title="配送與現場資訊" />
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm text-gray-400 font-black uppercase mb-1 block">送貨日期</label>
                      <input required type="date" className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold focus:ring-2 focus:ring-[#c25e00]/20"
                        value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm text-gray-400 font-black uppercase mb-1 block">偏好時段</label>
                      <select className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold focus:ring-2 focus:ring-[#c25e00]/20 appearance-none cursor-pointer"
                        value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})}>
                        <option>上午 (09-12)</option>
                        <option>下午 (13-17)</option>
                        <option>不限時間</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm text-gray-400 font-black uppercase mb-1 block">送貨地址</label>
                    <input required placeholder="請填寫完整配送地址" className="w-full bg-gray-50 border-none rounded-xl p-5 text-lg md:text-xl font-bold focus:ring-2 focus:ring-[#c25e00]/20"
                      value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm text-gray-500 font-black mb-1 block">現場收貨人姓名</label>
                      <input required placeholder="姓名" className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold"
                        value={formData.deliveryContact} onChange={e => setFormData({...formData, deliveryContact: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs md:text-sm text-gray-500 font-black mb-1 block">現場聯絡電話</label>
                      <input required placeholder="電話" type="tel" className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold"
                        value={formData.deliveryPhone} onChange={e => setFormData({...formData, deliveryPhone: e.target.value})} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <SectionHeader icon={Icons.User} title="訂購客戶資料" />
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm text-gray-400 font-black uppercase mb-1 block">公司寶號 (抬頭)</label>
                    <input required placeholder="請輸入完整公司名稱" className="w-full bg-gray-50 border-none rounded-xl p-5 text-lg md:text-xl font-bold focus:ring-2 focus:ring-[#c25e00]/20"
                      value={formData.orderCompany} onChange={e => setFormData({...formData, orderCompany: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs md:text-sm text-gray-500 font-black mb-1 block">訂購經辦人</label>
                       <input required placeholder="經辦姓名" className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold"
                        value={formData.orderContact} onChange={e => setFormData({...formData, orderContact: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs md:text-sm text-gray-500 font-black mb-1 block">經辦聯絡電話</label>
                       <input required placeholder="電話" type="tel" className="w-full bg-gray-50 border-none rounded-xl p-4 text-base md:text-lg font-bold"
                        value={formData.orderPhone} onChange={e => setFormData({...formData, orderPhone: e.target.value})} />
                     </div>
                  </div>
                </div>
              </section>

              <div className="text-center py-10 opacity-20 hidden md:block">
                <div className="text-[11px] font-serif tracking-[1.2em] uppercase">TILE PARK TAIWAN</div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100 md:static md:bg-transparent md:border-none md:p-0 md:mt-16 z-50">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#222] text-white py-6 rounded-3xl font-black tracking-[0.4em] text-xl hover:bg-[#c25e00] hover:shadow-2xl hover:-translate-y-1 transition-all disabled:bg-gray-300 shadow-xl flex items-center justify-center gap-4 active:scale-95 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>立即送出訂單 <Icons.Next size={24} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
              <div className="text-center mt-4 text-[11px] text-gray-300 font-bold md:hidden tracking-widest uppercase">© 2025 TILE PARK TAIWAN</div>
            </div>
          </form>
        </main>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
      `}</style>
    </div>
  );
}