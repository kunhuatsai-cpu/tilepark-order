import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, User, Plus, Trash2, CheckCircle, AlertCircle, MapPin, Phone, Calendar, Clock, ChevronRight, Printer } from 'lucide-react';

// 🛑 您的 Google Script 網址
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyq0KVfpLLIzRUJ5w_rFqZq4C8p97LJOGAU5OkWwts1012zB6-sJIehrtyNLjXepfm5/exec";

// --- Components ---

// 1. Logo Component
const Logo = ({ className = "" }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <img 
      src="https://lh3.googleusercontent.com/d/1N9nrujoaGkFpdGhsBRgOs_WE-RgQEhU2" 
      alt="TILE PARK" 
      className="w-48 md:w-72 object-contain transition-opacity duration-500"
      style={{ maxWidth: '240px', height: 'auto' }} 
    />
  </div>
);

// 2. 自訂彈出視窗 (Modal)
const Modal = ({ message, onClose, type = 'success' }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-6 animate-fade-in backdrop-blur-sm">
    <div className="bg-white w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
      <div className={`p-6 text-center ${type === 'success' ? 'bg-green-50' : 'bg-orange-50'}`}>
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#c25e00]'}`}>
          {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
        </div>
        <div className="text-gray-800 font-bold text-lg mb-2 whitespace-pre-wrap">{message}</div>
      </div>
      <button 
        onClick={onClose} 
        className="w-full py-4 bg-[#222] text-white font-bold tracking-widest hover:bg-[#333] active:bg-[#000] transition-colors"
      >
        確定
      </button>
    </div>
  </div>
);

// 3. 手機版區塊標題
const MobileSectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-3 mt-6 px-1">
    <div className="p-1.5 bg-orange-100 rounded-lg text-[#c25e00]">
      <Icon size={16} />
    </div>
    <h3 className="font-bold text-gray-800 text-sm tracking-wider">{title}</h3>
  </div>
);

export default function App() {
  const [styleLoaded, setStyleLoaded] = useState(false);

  // 🔮 自動注入 Tailwind CSS
  useEffect(() => {
    if (document.querySelector('script[src*="tailwindcss"]')) {
      setStyleLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => setTimeout(() => setStyleLoaded(true), 300);
      document.head.appendChild(script);
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
    deliveryTime: '上午 (09:00-12:00)',
    deliveryContact: '', 
    deliveryPhone: '', 
    deliveryAddress: '',
    orderCompany: '', 
    orderContact: '', 
    orderPhone: '',
  });

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: '', note: '' }]);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  
  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!GOOGLE_SCRIPT_URL) { setModalData({ msg: "請設定 Google Script 網址！", type: 'error' }); return; }
    setLoading(true);
    const newOrderId = `TILE-${new Date().toISOString().slice(5,10).replace('-','')}${Math.floor(1000 + Math.random() * 9000)}`;
    const submitData = { orderId: newOrderId, items: items, ...formData, timestamp: new Date().toLocaleString() };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      setOrderId(newOrderId);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) { setModalData({ msg: "連線問題，請截圖傳 LINE。", type: 'error' }); } finally { setLoading(false); }
  };

  const copyOrder = () => {
    const text = `您好，已下單 (${formData.orderType})\n單號 ${orderId}\n訂購公司：${formData.orderCompany}\n請協助確認庫存。`;
    const fallbackCopy = (text) => {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); setModalData({ msg: "✅ 複製成功！", type: 'success' }); } catch (err) { setModalData({ msg: "❌ 請手動截圖", type: 'error' }); }
        document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(() => setModalData({ msg: "✅ 複製成功！", type: 'success' })).catch(() => fallbackCopy(text)); } else { fallbackCopy(text); }
  };

  // Loading Screen
  if (!styleLoaded) {
    return (
      <div className="fixed inset-0 bg-white z-[99999] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#c25e00] rounded-full animate-spin mb-4"></div>
        <div className="text-xs text-gray-400 tracking-widest font-mono">LOADING APP...</div>
      </div>
    );
  }

  // --- 成功畫面 ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans animate-fade-in pb-20">
        {modalData && <Modal message={modalData.msg} type={modalData.type} onClose={() => setModalData(null)} />}
        
        <div className="bg-white w-full max-w-sm shadow-xl rounded-2xl overflow-hidden mb-6 relative">
          <div className="h-1.5 bg-[#c25e00] w-full"></div>
          <div className="p-8 pb-6 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-green-50">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-wide">訂單已送出</h2>
            <p className="text-xs text-gray-400 mb-6 tracking-wider font-mono">ORDER ID: {orderId}</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 border border-gray-100 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-500">類型</span>
                 <span className="font-bold text-gray-800">{formData.orderType}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500">訂購人</span>
                 <span className="font-bold text-gray-800">{formData.orderContact}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500">送貨日</span>
                 <span className="font-bold text-gray-800">{formData.deliveryDate}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3 fixed bottom-6 left-0 right-0 px-6 md:static md:px-0">
          <button onClick={copyOrder} className="w-full bg-[#222] text-white py-4 rounded-xl font-bold text-sm tracking-widest shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <span>📋</span> 複製訂單資訊
          </button>
          <a href="https://line.me/ti/p/@tileparktw" target="_blank" rel="noreferrer" className="w-full bg-[#06C755] text-white py-4 rounded-xl font-bold text-sm tracking-widest shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <span>💬</span> LINE 通知我們
          </a>
          <button onClick={() => window.location.reload()} className="w-full py-3 text-xs text-gray-400">
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // --- 主畫面 ---
  return (
    <div className={`min-h-screen font-sans text-gray-800 bg-[#f8f9fa] md:bg-[#e5e5e5] md:py-12 md:px-4 transition-opacity duration-700 ${styleLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {modalData && <Modal message={modalData.msg} type={modalData.type} onClose={() => setModalData(null)} />}

      <div className="w-full bg-white md:max-w-6xl md:mx-auto md:flex md:shadow-2xl md:rounded-sm md:min-h-[750px] overflow-hidden">
        
        {/* 左側：品牌區 (電腦版顯示) */}
        <div className="w-full md:w-[35%] bg-white text-[#222] p-6 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative">
           <Logo /> 
           <div className="hidden md:block w-16 h-0.5 bg-[#c25e00] mt-8 mb-8"></div>
           <div className="mt-2 space-y-4 text-center w-full hidden md:block">
              <h2 className="font-bold tracking-widest text-lg">薩鉅國際有限公司</h2>
              <div className="text-xs tracking-wide space-y-2 text-gray-500">
                 <p>📍 新北市板橋區金門街215巷78-5號</p>
                 <p>📞 02-86860028</p>
                 <p>📠 02-81926543</p>
              </div>
           </div>
        </div>

        {/* 右側：表單區 (手機版 App 風格) */}
        <div className="w-full md:w-[65%] bg-[#f8f9fa] md:bg-white relative">
          
          <form onSubmit={handleSubmit} className="pb-32 md:pb-12 h-full md:h-auto overflow-y-auto md:overflow-visible">
            
            <div className="p-4 md:p-12 space-y-6">
              
              {/* 訂單類型切換 */}
              <div className="bg-gray-200/50 p-1 rounded-xl flex">
                {['新案場', '案場追加訂單'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, orderType: type})}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                      formData.orderType === type 
                        ? 'bg-white text-[#c25e00] shadow-sm ring-1 ring-black/5' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* 1. 訂購內容 */}
              <section>
                <MobileSectionHeader icon={ShoppingBag} title="訂購內容" />
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group animate-fade-in-up">
                      <div className="absolute top-0 right-0 bg-gray-100 text-[10px] px-2 py-1 rounded-bl-lg text-gray-400 font-mono">
                        #{index + 1}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 font-bold mb-1 block">品名 / 型號</label>
                          <input required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-[#c25e00]/20 focus:border-[#c25e00] outline-none transition-all"
                            placeholder="請輸入磁磚型號" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-[2]">
                            <label className="text-xs text-gray-400 font-bold mb-1 block">數量</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-base text-center focus:ring-2 focus:ring-[#c25e00]/20 focus:border-[#c25e00] outline-none transition-all"
                              placeholder="箱/片" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} />
                          </div>
                          <div className="flex-[3]">
                            <label className="text-xs text-gray-400 font-bold mb-1 block">備註</label>
                            <input className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-[#c25e00]/20 focus:border-[#c25e00] outline-none transition-all"
                              placeholder="批號/區域" value={item.note} onChange={e => updateItem(item.id, 'note', e.target.value)} />
                          </div>
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 bg-white text-red-400 shadow-md rounded-full p-1.5 border border-red-50 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addItem} className="w-full py-3.5 border-2 border-dashed border-gray-300 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-[#c25e00] hover:text-[#c25e00] hover:bg-orange-50 transition-all active:scale-[0.99]">
                    <Plus size={18} /> 新增商品
                  </button>
                </div>
              </section>

              {/* 2. 送貨資訊 */}
              <section>
                <MobileSectionHeader icon={Truck} title="送貨資訊" />
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1 text-xs text-gray-400 font-bold mb-1"><Calendar size={12}/> 日期</label>
                      <input required type="date" className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none"
                        value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs text-gray-400 font-bold mb-1"><Clock size={12}/> 時間</label>
                      <select className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none appearance-none"
                        value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})}>
                        <option>上午 (09-12)</option>
                        <option>下午 (13-17)</option>
                        <option>不限時間</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs text-gray-400 font-bold mb-1"><MapPin size={12}/> 地址</label>
                    <input required placeholder="請輸入完整地址" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-base focus:border-[#c25e00] outline-none"
                      value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1">現場聯絡人</label>
                      <input required placeholder="姓名" className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none"
                        value={formData.deliveryContact} onChange={e => setFormData({...formData, deliveryContact: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1">現場電話</label>
                      <input required placeholder="手機" type="tel" className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none"
                        value={formData.deliveryPhone} onChange={e => setFormData({...formData, deliveryPhone: e.target.value})} />
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. 訂購人 */}
              <section>
                <MobileSectionHeader icon={User} title="訂購人資料" />
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1">公司寶號 (抬頭)</label>
                    <input required placeholder="請輸入公司名稱" className="w-full bg-gray-50 border-gray-200 rounded-lg p-3 text-base focus:border-[#c25e00] outline-none"
                      value={formData.orderCompany} onChange={e => setFormData({...formData, orderCompany: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="text-xs text-gray-400 font-bold mb-1">您的姓名</label>
                       <input required placeholder="訂購人" className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none"
                        value={formData.orderContact} onChange={e => setFormData({...formData, orderContact: e.target.value})} />
                     </div>
                     <div>
                       <label className="text-xs text-gray-400 font-bold mb-1">聯絡電話</label>
                       <input required placeholder="手機" type="tel" className="w-full bg-gray-50 border-gray-200 rounded-lg p-2.5 text-sm focus:border-[#c25e00] outline-none"
                        value={formData.orderPhone} onChange={e => setFormData({...formData, orderPhone: e.target.value})} />
                     </div>
                  </div>
                </div>
              </section>

              {/* 🔥 新增：頁尾資訊區塊 (手機版顯示) */}
              <div className="mt-8 mb-24 md:mb-0 space-y-4 text-center border-t border-gray-100 pt-6">
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-700 tracking-widest text-sm">薩鉅國際有限公司</h4>
                  <div className="text-xs text-gray-500 space-y-1.5 flex flex-col items-center">
                    <a href="https://maps.app.goo.gl/9Wz9Q8q8Q8Q8Q8Q8" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#c25e00] transition-colors">
                      <MapPin size={12} /> 新北市板橋區金門街215巷78-5號
                    </a>
                    <div className="flex gap-4 justify-center">
                      <a href="tel:0286860028" className="flex items-center gap-1 hover:text-[#c25e00] transition-colors">
                        <Phone size={12} /> 02-86860028
                      </a>
                      <span className="flex items-center gap-1 text-gray-400 cursor-default">
                        <Printer size={12} /> 02-81926543
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-300 font-serif tracking-widest">
                  © 2025 TILE PARK TAIWAN
                </div>
              </div>

            </div>

            {/* Sticky Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 md:static md:bg-transparent md:border-none md:p-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#222] text-white py-4 rounded-xl font-bold tracking-[0.2em] hover:bg-[#c25e00] transition-colors disabled:bg-gray-400 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    傳送中...
                  </>
                ) : (
                  <>
                    送出訂單 <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}