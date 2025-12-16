import React, { useState, useEffect } from 'react';

// 🛑【關鍵】Google Script 網址
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2EW2TKQKAW91DI8a-NITQqK7Ys1NNFL0CujKcKU-sdqzzdqx412x-PrFDDZDgCKS7/exec";

// --- Components ---

// 1. Logo Component
const Logo = ({ isDark }) => {
  const logoUrl = "https://lh3.googleusercontent.com/d/1N9nrujoaGkFpdGhsBRgOs_WE-RgQEhU2";

  return (
    <div className="flex flex-col items-center justify-center">
      <img 
        src={logoUrl} 
        alt="TILE PARK" 
        // 尺寸設定：w-60 (手機), md:w-72 (電腦)
        className="w-60 md:w-72 mb-2 object-contain transition-opacity duration-500"
        // 強制寫死最大寬度 (Max Width)，防止載入瞬間圖片過大
        style={{ maxWidth: '240px', height: 'auto' }} 
        // 針對電腦版放寬限制
        {...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { style: { maxWidth: '300px', height: 'auto' } } : {})}
      />
    </div>
  );
};

// 2. 自訂彈出視窗
const Modal = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 animate-fade-in backdrop-blur-sm">
    <div className="bg-white p-6 w-full max-w-xs shadow-2xl text-center border-t-4 border-[#c25e00] rounded-sm">
      <div className="mb-6 text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">{message}</div>
      <button onClick={onClose} className="bg-[#222] text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-[#c25e00] transition-colors w-full rounded-sm">OK</button>
    </div>
  </div>
);

export default function App() {
  const [styleLoaded, setStyleLoaded] = useState(false);

  // 🔮 自動注入 Tailwind CSS 並防止樣式閃爍
  useEffect(() => {
    // 檢查是否已經有 Tailwind
    if (document.querySelector('script[src*="tailwindcss"]')) {
      setTimeout(() => setStyleLoaded(true), 500);
    } else {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      // ✨ 關鍵：腳本載入後，再多等 500ms (0.5秒) 才顯示畫面
      script.onload = () => {
        setTimeout(() => setStyleLoaded(true), 500);
      };
      document.head.appendChild(script);
    }
  }, []);

  const [items, setItems] = useState([{ id: 1, name: '', qty: '', note: '' }]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [modalMsg, setModalMsg] = useState(null);
  
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

  const addItem = () => setItems([...items, { id: Date.now(), name: '', qty: '', note: '' }]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!GOOGLE_SCRIPT_URL) { setModalMsg("請設定 Google Script 網址！"); return; }
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
    } catch (error) { setModalMsg("連線問題，請截圖傳 LINE。"); } finally { setLoading(false); }
  };

  const copyOrder = () => {
    const text = `您好，已下單 (${formData.orderType})\n單號 ${orderId}\n訂購公司：${formData.orderCompany}\n請協助確認庫存。`;
    const fallbackCopy = (text) => {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); setModalMsg("✅ 複製成功！"); } catch (err) { setModalMsg("❌ 請手動截圖"); }
        document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(() => setModalMsg("✅ 複製成功！")).catch(() => fallbackCopy(text)); } else { fallbackCopy(text); }
  };

  // ⚠️ 防止 FOUC: 樣式未載入前顯示全白畫面
  if (!styleLoaded) {
    return (
      <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        backgroundColor: '#fff', zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #c25e00', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- 成功畫面 ---
  if (submitted) {
    const logoUrl = "https://lh3.googleusercontent.com/d/1N9nrujoaGkFpdGhsBRgOs_WE-RgQEhU2";

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans animate-fade-in">
        {modalMsg && <Modal message={modalMsg} onClose={() => setModalMsg(null)} />}
        
        {/* 訂單確認卡片 */}
        <div className="bg-white w-full max-w-sm shadow-2xl overflow-hidden mb-6 relative rounded-sm">
          <div className="h-2 bg-[#c25e00] w-full"></div>
          
          <div className="p-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
               <img 
                 src={logoUrl} 
                 alt="TILE PARK" 
                 className="w-40 object-contain" 
                 style={{ maxWidth: '200px', height: 'auto' }}
               />
            </div>
            
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
              ✓
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-wide">訂單已送出</h2>
            <p className="text-xs text-gray-400 mb-6 tracking-wider">ORDER SUBMITTED</p>

            {/* 票券資訊區 */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-5 text-left space-y-3 rounded-md mb-6 relative">
               <div className="absolute -left-2 top-1/2 w-4 h-4 bg-white rounded-full -mt-2 border-r border-gray-200"></div>
               <div className="absolute -right-2 top-1/2 w-4 h-4 bg-white rounded-full -mt-2 border-l border-gray-200"></div>
               
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-gray-400 uppercase tracking-wider">Order Type</span>
                 <span className={`text-xs font-bold px-2 py-1 rounded text-white ${formData.orderType === '新案場' ? 'bg-[#c25e00]' : 'bg-gray-700'}`}>
                   {formData.orderType}
                 </span>
               </div>

               <div>
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                 <p className="font-mono text-xl font-bold text-[#c25e00] tracking-wider">{orderId}</p>
               </div>
               
               <div className="h-px bg-gray-200 w-full"></div>
               
               <div className="flex justify-between text-sm items-baseline">
                 <span className="text-gray-500 text-xs">訂購人</span>
                 <span className="font-bold text-gray-800">{formData.orderContact}</span>
               </div>
               <div className="flex justify-between text-sm items-baseline">
                 <span className="text-gray-500 text-xs">送貨日</span>
                 <span className="font-bold text-gray-800">{formData.deliveryDate}</span>
               </div>
            </div>

            <p className="text-xs text-red-500 font-bold bg-red-50 py-2 px-3 rounded-sm">
              ⚠️ 請務必通知我們，並等待回傳【訂單確認】後，訂單才算成立喔！
            </p>
          </div>
        </div>

        {/* 動作按鈕 */}
        <div className="w-full max-w-sm space-y-3">
          <button onClick={copyOrder} className="w-full bg-[#333] text-white py-4 font-bold text-sm tracking-widest shadow-md hover:bg-[#c25e00] transition-colors flex items-center justify-center gap-2 rounded-sm active:scale-[0.98]">
            <span>📋</span> 1. 複製訂單資訊
          </button>
          
          <a href="https://line.me/ti/p/@tileparktw" target="_blank" rel="noreferrer" className="w-full bg-[#06C755] text-white py-4 font-bold text-sm tracking-widest shadow-md hover:bg-[#05b34c] transition-colors flex items-center justify-center gap-2 rounded-sm active:scale-[0.98]">
            <span>💬</span> 2. 前往 LINE 確認庫存
          </a>
          
          <button onClick={() => window.location.reload()} className="w-full py-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // --- 主畫面 ---
  return (
    <div className={`min-h-screen font-sans text-gray-800 bg-white md:bg-[#e5e5e5] md:py-12 md:px-4 transition-all duration-700 ${styleLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {modalMsg && <Modal message={modalMsg} onClose={() => setModalMsg(null)} />}

      <div className="w-full bg-white md:max-w-6xl md:mx-auto md:flex md:shadow-2xl md:rounded-sm md:min-h-[750px] overflow-hidden">
        
        {/* 左側：品牌區 */}
        <div className="w-full md:w-[35%] bg-white text-[#222] p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative transition-colors duration-300">
           <Logo isDark={false} /> 
           
           <div className="hidden md:block w-16 h-0.5 bg-[#c25e00] mt-8 mb-8"></div>
           
           <div className="mt-2 space-y-4 text-center w-full brand-section">
              <h2 className="font-bold tracking-widest text-base md:text-lg">薩鉅國際有限公司</h2>
              
              {/* 手機版強制垂直排列 */}
              <div className="text-xs tracking-wide space-y-2 text-gray-500 flex flex-col items-center gap-1">
                 <p className="flex items-center gap-2">📍 新北市板橋區金門街215巷78-5號</p>
                 <p className="flex items-center gap-2">📞 02-86860028</p>
                 <p className="hidden md:flex items-center gap-2">📠 02-81926543</p>
              </div>
           </div>
           
           <div className="hidden md:block absolute bottom-6 text-[10px] text-gray-400 font-serif tracking-[0.3em] uppercase">
             Authentic Japanese Tiles
           </div>
        </div>

        {/* 右側：表單區 */}
        <div className="w-full md:w-[65%] bg-white p-5 pb-20 md:p-12 md:overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 訂單類型選擇 */}
            <div className="flex flex-col gap-2 mb-2">
              <label className="text-[10px] text-gray-400 block tracking-widest uppercase font-bold">Order Type / 訂單類型</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, orderType: '新案場'})}
                  className={`flex-1 py-3 text-sm tracking-widest border transition-all duration-200 rounded-sm ${
                    formData.orderType === '新案場' 
                      ? 'bg-[#222] text-white border-[#222] shadow-md' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  新案場
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, orderType: '案場追加訂單'})}
                  className={`flex-1 py-3 text-sm tracking-widest border transition-all duration-200 rounded-sm ${
                    formData.orderType === '案場追加訂單' 
                      ? 'bg-[#222] text-white border-[#222] shadow-md' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  追加訂單
                </button>
              </div>
            </div>

            {/* 1. 訂購內容 */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                <span className="text-[#c25e00] font-bold text-lg font-mono">01.</span>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Order List / 訂購內容</h3>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="relative bg-gray-50 p-4 border hover:border-gray-300 transition-colors group">
                    <div className="flex gap-3 mb-2">
                      <div className="flex-[3]">
                        <label className="text-[10px] text-gray-400 block mb-1">品名 / 型號</label>
                        <input required className="w-full bg-transparent border-b border-gray-300 focus:border-[#c25e00] outline-none py-1 text-sm rounded-none"
                          value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                      </div>
                      <div className="flex-[1]">
                        <label className="text-[10px] text-gray-400 block mb-1 text-center">數量</label>
                        <input required className="w-full bg-transparent border-b border-gray-300 focus:border-[#c25e00] outline-none py-1 text-sm text-center rounded-none"
                          value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} />
                      </div>
                    </div>
                    <input placeholder="備註 (批號、使用區域)" className="w-full text-xs text-gray-500 bg-transparent outline-none placeholder-gray-300"
                      value={item.note} onChange={e => updateItem(item.id, 'note', e.target.value)} />
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-lg leading-none p-1">×</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="w-full py-3 border border-dashed border-gray-300 text-gray-400 text-xs tracking-widest hover:border-[#c25e00] hover:text-[#c25e00] hover:bg-orange-50 transition-colors uppercase">
                  + Add Item
                </button>
              </div>
            </section>

            {/* 2. 送貨資訊 */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                <span className="text-[#c25e00] font-bold text-lg font-mono">02.</span>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Delivery / 送貨資訊</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">日期</label>
                  <input required type="date" className="w-full bg-gray-50 p-2 text-sm border-none outline-none focus:ring-1 focus:ring-[#c25e00]"
                    value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">時間</label>
                  <select className="w-full bg-gray-50 p-2 text-sm border-none outline-none focus:ring-1 focus:ring-[#c25e00]"
                    value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})}>
                    <option>上午 (09-12)</option>
                    <option>下午 (13-17)</option>
                    <option>不限時間</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <input required placeholder="送貨地址" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                  value={formData.deliveryAddress} onChange={e => setFormData({...formData, deliveryAddress: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="現場聯絡人" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                    value={formData.deliveryContact} onChange={e => setFormData({...formData, deliveryContact: e.target.value})} />
                  <input required placeholder="現場電話" type="tel" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                    value={formData.deliveryPhone} onChange={e => setFormData({...formData, deliveryPhone: e.target.value})} />
                </div>
              </div>
            </section>

            {/* 3. 訂購人 */}
            <section>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                <span className="text-[#c25e00] font-bold text-lg font-mono">03.</span>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Client / 訂購人</h3>
              </div>
              <div className="space-y-4">
                <input required placeholder="公司寶號 (抬頭)" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                  value={formData.orderCompany} onChange={e => setFormData({...formData, orderCompany: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <input required placeholder="您的姓名" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                    value={formData.orderContact} onChange={e => setFormData({...formData, orderContact: e.target.value})} />
                   <input required placeholder="聯絡電話" type="tel" className="w-full border-b border-gray-200 py-2 text-sm focus:border-[#c25e00] outline-none rounded-none"
                    value={formData.orderPhone} onChange={e => setFormData({...formData, orderPhone: e.target.value})} />
                </div>
              </div>
            </section>

            <button type="submit" disabled={loading} className="w-full bg-[#222] text-white py-4 font-bold tracking-[0.2em] hover:bg-[#c25e00] transition-colors disabled:bg-gray-400 mt-6 shadow-lg">
              {loading ? '傳送中...' : '送出訂單'}
            </button>
            
            <p className="text-center text-[10px] text-gray-300 font-serif tracking-widest pt-2">© 2025 TILE PARK TAIWAN</p>
          </form>
        </div>
      </div>
    </div>
  );
}