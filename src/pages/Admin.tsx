
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Product, ProductImage } from '../types';
import { Trash2, Plus, Upload, Link as LinkIcon, Edit, X, GripVertical, RefreshCw, Archive, Search, Package, ShoppingBag, LayoutDashboard, DollarSign, TrendingUp, Users, Filter, AlertTriangle, CheckSquare, Tag, Layout, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Toast, { ToastType } from '../components/Toast';
import { useSiteStore, Section, Slide } from '../lib/store';
import AdminLayout from '../components/admin/AdminLayout';

const ADMIN_EMAIL = 'humility135@gmail.com';

interface FormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category: string;
  series: string;
  images: ProductImage[];
  stock_quantity: number;
  variants: { size: string; color: string; stock_quantity: number }[];
}

const DeleteConfirmButton = ({ onConfirm, title = "刪除" }: { onConfirm: () => void, title?: string }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    if (showConfirm) {
        return (
            <div className="flex items-center gap-1 animate-fade-in bg-red-50 p-1 rounded border border-red-100">
                <span className="text-xs text-red-600 font-medium whitespace-nowrap mr-1">確定?</span>
                <button 
                    onClick={(e) => { e.stopPropagation(); onConfirm(); setShowConfirm(false); }}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    title="確認刪除"
                >
                    <CheckSquare className="w-3 h-3" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                    className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                    title="取消"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title={title}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
};

const SortableImage = ({ img, idx, onRemove, onUpdateColor }: { img: ProductImage, idx: number, onRemove: (index: number) => void, onUpdateColor: (index: number, color: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: img.url }); // Using URL as unique ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white"
    >
        <div 
            {...attributes} 
            {...listeners} 
            className="absolute top-1 left-1 z-10 p-1 bg-white/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
        <div className="aspect-w-1 aspect-h-1">
            <img src={img.url} alt={`Product ${idx}`} className="object-cover w-full h-24" />
        </div>
        <div className="p-1 bg-gray-50 border-t border-gray-200">
            <input 
                type="text" 
                value={img.color || ''} 
                onChange={(e) => onUpdateColor(idx, e.target.value)}
                placeholder="輸入顏色"
                className="w-full text-xs text-center bg-transparent border-none focus:ring-0 p-1 outline-none"
                onKeyDown={(e) => e.stopPropagation()} // Prevent sortable from capturing key events
            />
        </div>
        <button
            type="button"
            onClick={() => onRemove(idx)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
            <X className="w-3 h-3" />
        </button>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || session.user.email !== ADMIN_EMAIL) {
        alert('您沒有權限訪問此頁面');
        navigate('/');
    }
    setCheckingAuth(false);
  };

  if (checkingAuth) {
      return <div className="text-center py-20">正在驗證權限...</div>;
  }

  const title = (() => {
    const path = location.pathname;
    if (path.startsWith('/admin/products')) return 'Products';
    if (path.startsWith('/admin/orders')) return 'Orders';
    if (path.startsWith('/admin/site')) return '網頁設計';
    if (path.startsWith('/admin/settings')) return 'Settings';
    return 'Dashboard';
  })();

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <AdminLayout title={title} onLogout={onLogout}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager showToast={showToast} />} />
          <Route path="orders" element={<OrderManager showToast={showToast} />} />
          <Route path="site" element={<SiteBuilder showToast={showToast} />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-lg font-bold text-gray-900 mb-2">Settings</div>
      <div className="text-sm text-gray-500">稍後加入付款、運費、權限等設定。</div>
    </div>
  );
};

const SiteBuilder = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
    const { sections, updateSection, globalSettings, updateGlobalSettings, resetToDefault, lastSyncedAt } = useSiteStore();
    const [uploading, setUploading] = useState(false);

    // Image Cropping State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);
    const [cropTarget, setCropTarget] = useState<{type: 'logo' | 'slide', sectionId?: string, slideIndex?: number} | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Safe check for corrupted settings
    if (!globalSettings || !globalSettings.siteIdentity) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
                <h2 className="text-xl font-bold text-red-700 mb-4">設定資料已損毀</h2>
                <p className="text-gray-700 mb-6">由於先前的錯誤，您的網頁設定已經損毀並無法讀取。</p>
                <button 
                    onClick={() => {
                        resetToDefault();
                        window.location.reload();
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                >
                    點擊此處強制重置並修復
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-200 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">網頁設計 (Site Builder)</h2>
                    <p className="text-sm text-gray-500 mt-1">直接在下方修改內容，所有變更會即時儲存至前台。</p>
                    <p className="text-xs text-gray-400 mt-1">
                        最後同步：{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString('zh-HK', { hour12: false }) : '未同步'}
                    </p>
                </div>
                <button 
                    onClick={() => {
                        if(window.confirm('確定要重置所有設定為預設值嗎？')) {
                            resetToDefault();
                            showToast('已重置為預設值', 'success');
                        }
                    }}
                    className="text-sm px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 whitespace-nowrap"
                >重置為預設值</button>
            </div>

            {/* 1. 全站設定 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg">1. 基本設定 (Global Settings)</h3>
                </div>
                <div className="p-6 space-y-8">
                    {/* Identity */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 border-b pb-2">網站名稱與 Logo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">網站名稱</label>
                                <input 
                                    type="text" 
                                    value={globalSettings.siteIdentity.siteName || ''} 
                                    onChange={(e) => updateGlobalSettings({ siteIdentity: { ...globalSettings.siteIdentity, siteName: e.target.value } })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo 圖片</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={globalSettings.siteIdentity.logoUrl || ''} 
                                            onChange={(e) => updateGlobalSettings({ siteIdentity: { ...globalSettings.siteIdentity, logoUrl: e.target.value } })}
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                            placeholder="圖片 URL 或點擊上傳"
                                        />
                                        <label className={`flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            <span className="ml-2 hidden sm:inline">上傳</span>
                                            <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            const reader = new FileReader();
                                                            reader.addEventListener('load', () => {
                                                                setCropTarget({ type: 'logo' });
                                                                setCropImageSrc(reader.result?.toString() || null);
                                                            });
                                                            reader.readAsDataURL(e.target.files[0]);
                                                        }
                                                    }} 
                                                    disabled={uploading} 
                                                />
                                        </label>
                                    </div>
                                </div>
                                {globalSettings.siteIdentity.logoUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                            <span>Logo 大小 (高度)</span>
                                            <span className="text-gray-500">{globalSettings.siteIdentity.logoSize || 80}px</span>
                                        </label>
                                        <input 
                                            type="range" min="30" max="200" step="5"
                                            value={globalSettings.siteIdentity.logoSize || 80} 
                                            onChange={(e) => updateGlobalSettings({ siteIdentity: { ...globalSettings.siteIdentity, logoSize: parseInt(e.target.value) } })}
                                            className="w-full accent-black"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Announcement */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 border-b pb-2">頂部公告欄 (Announcement Bar)</h4>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={globalSettings.announcement?.isVisible || false} 
                                    onChange={(e) => updateGlobalSettings({ announcement: { ...globalSettings.announcement, isVisible: e.target.checked } })}
                                    className="rounded border-gray-300 text-black focus:ring-black"
                                />
                                <span className="text-sm font-medium text-gray-700">顯示公告欄</span>
                            </label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">公告文字</label>
                                    <input 
                                        type="text" 
                                        value={globalSettings.announcement?.text || ''} 
                                        onChange={(e) => updateGlobalSettings({ announcement: { ...globalSettings.announcement, text: e.target.value } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">連結 (選填)</label>
                                    <input 
                                        type="text" 
                                        value={globalSettings.announcement?.link || ''} 
                                        onChange={(e) => updateGlobalSettings({ announcement: { ...globalSettings.announcement, link: e.target.value } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                        placeholder="/products"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 border-b pb-2">頁尾設定 (Footer)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">網站描述</label>
                                    <textarea 
                                        value={globalSettings.footer?.description || ''} 
                                        onChange={(e) => updateGlobalSettings({ footer: { ...globalSettings.footer, description: e.target.value } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">版權文字</label>
                                    <input 
                                        type="text" 
                                        value={globalSettings.footer?.copyrightText || ''} 
                                        onChange={(e) => updateGlobalSettings({ footer: { ...globalSettings.footer, copyrightText: e.target.value } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram 連結</label>
                                    <input 
                                        type="text" 
                                        value={globalSettings.footer?.social?.instagram || ''} 
                                        onChange={(e) => updateGlobalSettings({ footer: { ...globalSettings.footer, social: { ...globalSettings.footer?.social, instagram: e.target.value } } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook 連結</label>
                                    <input 
                                        type="text" 
                                        value={globalSettings.footer?.social?.facebook || ''} 
                                        onChange={(e) => updateGlobalSettings({ footer: { ...globalSettings.footer, social: { ...globalSettings.footer?.social, facebook: e.target.value } } })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 首頁內容 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 text-lg">2. 首頁內容 (Home Sections)</h3>
                </div>
                <div className="p-6 space-y-10">
                    {sections.map((section) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-6 relative bg-white shadow-sm">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                                        section.type === 'hero' ? 'bg-purple-100 text-purple-800' :
                                        section.type === 'products-grid' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>{section.type}</span>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        {section.type === 'hero' ? '首頁輪播圖' : 
                                         section.type === 'products-grid' ? '商品展示區' : '特色區塊'}
                                    </h4>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-700">顯示區塊</span>
                                    <input 
                                        type="checkbox" 
                                        checked={section.isVisible} 
                                        onChange={(e) => updateSection(section.id, { isVisible: e.target.checked })} 
                                        className="rounded border-gray-300 text-black focus:ring-black w-5 h-5" 
                                    />
                                </label>
                            </div>

                            {/* Content based on type */}
                            <div className={`${!section.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                                
                                {section.type !== 'hero' && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">區塊大標題 (Title)</label>
                                        <input 
                                            type="text" 
                                            value={section.title || ''}
                                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                            className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                                        />
                                    </div>
                                )}

                                {section.type === 'hero' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <span className="text-sm text-gray-600 font-medium">輪播圖列表</span>
                                            <button onClick={() => {
                                                const newSlide = { id: `slide-${Date.now()}`, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80", subtitle: "New Collection", title: "New Slide", description: "Add your description here", link: "/products" };
                                                updateSection(section.id, { content: { ...section.content, slides: [...section.content.slides, newSlide] } });
                                            }} className="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> 新增一張輪播圖
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            {section.content.slides.map((slide: any, slideIndex: number) => (
                                                <div key={slide.id} className="bg-gray-50 border border-gray-200 rounded p-4 relative">
                                                    <button onClick={() => {
                                                        if(window.confirm('確定刪除這張輪播圖？')) {
                                                            const updatedSlides = section.content.slides.filter((s: any) => s.id !== slide.id);
                                                            updateSection(section.id, { content: { ...section.content, slides: updatedSlides } });
                                                        }
                                                    }} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-md border border-red-100 bg-white shadow-sm text-xs flex items-center gap-1"><Trash2 className="w-3 h-3"/> 刪除</button>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="md:col-span-1">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">圖片 (Image URL)</label>
                                                            <img src={slide.image} className="w-full h-32 object-cover rounded border border-gray-200 mb-2" alt="slide" />
                                                            <div className="flex gap-2">
                                                                <input type="text" value={slide.image} onChange={(e) => {
                                                                    const updatedSlides = [...section.content.slides];
                                                                    updatedSlides[slideIndex].image = e.target.value;
                                                                    updateSection(section.id, { content: { ...section.content, slides: updatedSlides } });
                                                                }} className="flex-1 text-xs rounded border-gray-300 shadow-sm" />
                                                                <label className={`flex items-center justify-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                                    <Upload className="w-3 h-3" />
                                                                    <input 
                                                                        type="file" 
                                                                        className="hidden" 
                                                                        accept="image/*" 
                                                                        onChange={(e) => {
                                                                            if (e.target.files && e.target.files.length > 0) {
                                                                                const reader = new FileReader();
                                                                                reader.addEventListener('load', () => {
                                                                                    setCropTarget({ type: 'slide', sectionId: section.id, slideIndex });
                                                                                    setCropImageSrc(reader.result?.toString() || null);
                                                                                });
                                                                                reader.readAsDataURL(e.target.files[0]);
                                                                            }
                                                                        }} 
                                                                        disabled={uploading} 
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-3">
                                                            <div><label className="block text-xs font-medium text-gray-700 mb-1">小標題 (Subtitle)</label><input type="text" value={slide.subtitle} onChange={e => { const updatedSlides = [...section.content.slides]; updatedSlides[slideIndex].subtitle = e.target.value; updateSection(section.id, { content: { ...section.content, slides: updatedSlides } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm" /></div>
                                                            <div><label className="block text-xs font-medium text-gray-700 mb-1">主標題 (Title HTML)</label><textarea value={slide.title} onChange={e => { const updatedSlides = [...section.content.slides]; updatedSlides[slideIndex].title = e.target.value; updateSection(section.id, { content: { ...section.content, slides: updatedSlides } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm font-mono" rows={2} /></div>
                                                            <div><label className="block text-xs font-medium text-gray-700 mb-1">描述 (Description)</label><input type="text" value={slide.description} onChange={e => { const updatedSlides = [...section.content.slides]; updatedSlides[slideIndex].description = e.target.value; updateSection(section.id, { content: { ...section.content, slides: updatedSlides } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm" /></div>
                                                            <div><label className="block text-xs font-medium text-gray-700 mb-1">按鈕連結 (Link)</label><input type="text" value={slide.link} onChange={e => { const updatedSlides = [...section.content.slides]; updatedSlides[slideIndex].link = e.target.value; updateSection(section.id, { content: { ...section.content, slides: updatedSlides } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm" /></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {section.type === 'products-grid' && (
                                    <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                                        ℹ️ 此區塊會自動抓取資料庫中的 <strong>{section.content.source === 'new_arrivals' ? '最新上架' : '熱門商品'}</strong> 前 {section.content.limit} 筆。
                                    </div>
                                )}

                                {section.type === 'features' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {section.content.items.map((item: any, itemIndex: number) => (
                                                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
                                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">圖標代碼 (Lucide Icon)</label><input type="text" value={item.icon} onChange={e => { const updated = [...section.content.items]; updated[itemIndex].icon = e.target.value; updateSection(section.id, { content: { ...section.content, items: updated } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm font-mono" /></div>
                                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">標題</label><input type="text" value={item.title} onChange={e => { const updated = [...section.content.items]; updated[itemIndex].title = e.target.value; updateSection(section.id, { content: { ...section.content, items: updated } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm" /></div>
                                                    <div><label className="block text-xs font-medium text-gray-700 mb-1">描述</label><textarea value={item.description} onChange={e => { const updated = [...section.content.items]; updated[itemIndex].description = e.target.value; updateSection(section.id, { content: { ...section.content, items: updated } }); }} className="w-full text-sm rounded border-gray-300 shadow-sm" rows={2} /></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Image Cropper Modal */}
            {cropImageSrc && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">裁切圖片</h3>
                            <button onClick={() => setCropImageSrc(null)}><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center border border-gray-200 rounded">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                                <img ref={imgRef} src={cropImageSrc} alt="Crop me" className="max-h-[60vh] w-auto" />
                            </ReactCrop>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setCropImageSrc(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">取消</button>
                            <button 
                                onClick={async () => {
                                    if (!completedCrop || !imgRef.current) return;
                                    const image = imgRef.current;
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    if (!ctx) return;

                                    const scaleX = image.naturalWidth / image.width;
                                    const scaleY = image.naturalHeight / image.height;
                                    canvas.width = completedCrop.width * scaleX;
                                    canvas.height = completedCrop.height * scaleY;
                                    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY);

                                    canvas.toBlob(async (blob) => {
                                        if (!blob) return;
                                        setUploading(true);
                                        setCropImageSrc(null);
                                        try {
                                            const fileExt = 'png';
                                            const filePath = `images-${Math.random()}.${fileExt}`;
                                            const file = new File([blob], filePath, { type: 'image/png' });
                                            const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
                                            if (uploadError) throw uploadError;
                                            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                                            
                                            if (cropTarget?.type === 'logo') {
                                                updateGlobalSettings({ siteIdentity: { ...globalSettings.siteIdentity, logoUrl: data.publicUrl } });
                                            } else if (cropTarget?.type === 'slide' && cropTarget.sectionId && cropTarget.slideIndex !== undefined) {
                                                const section = sections.find(s => s.id === cropTarget.sectionId);
                                                if (section && section.type === 'hero') {
                                                    const updatedSlides = [...section.content.slides];
                                                    updatedSlides[cropTarget.slideIndex].image = data.publicUrl;
                                                    updateSection(section.id, { content: { ...section.content, slides: updatedSlides } });
                                                }
                                            }
                                            
                                            showToast('圖片裁切並上傳成功', 'success');
                                        } catch (error: any) {
                                            showToast('Logo 上傳失敗: ' + error.message, 'error');
                                        } finally {
                                            setUploading(false);
                                        }
                                    }, 'image/png');
                                }}
                                disabled={!completedCrop?.width || !completedCrop?.height}
                                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >確認並上傳</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


const OnSaleManager = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [bulkDiscount, setBulkDiscount] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'on_sale' | 'no_sale'>('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('載入產品失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedProductIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedProductIds(newSelection);
    };

    const selectAll = () => {
        if (selectedProductIds.size === filteredProducts.length) {
            setSelectedProductIds(new Set());
        } else {
            setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const applyBulkDiscount = async () => {
        if (selectedProductIds.size === 0) {
            showToast('請先選擇產品', 'error');
            return;
        }
    
        const discount = parseFloat(bulkDiscount);
        if (isNaN(discount) || discount <= 0 || discount >= 100) {
            showToast('請輸入有效的折扣百分比 (1-99)', 'error');
            return;
        }
    
        if (!window.confirm(`確定要為 ${selectedProductIds.size} 個選定產品應用 ${discount}% OFF 嗎？`)) return;
    
        try {
            setLoading(true);
            const productsToUpdate = products.filter(p => selectedProductIds.has(p.id));
            
            // Sequential update as supabase doesn't support bulk update with computed values easily
            for (const p of productsToUpdate) {
                const salePrice = Math.round(p.price * (1 - discount / 100));
                const { error } = await supabase
                    .from('products')
                    .update({ sale_price: salePrice })
                    .eq('id', p.id);
                if (error) throw error;
            }
    
            await fetchProducts();
            setSelectedProductIds(new Set());
            setBulkDiscount('');
            showToast('批量折扣應用成功！', 'success');
        } catch (error: any) {
            console.error('Error applying discount:', error);
            showToast('應用失敗: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const removeBulkDiscount = async () => {
        if (selectedProductIds.size === 0) {
            showToast('請先選擇產品', 'error');
            return;
        }
    
        if (!window.confirm(`確定要移除 ${selectedProductIds.size} 個選定產品的特價嗎？`)) return;
    
        try {
            setLoading(true);
            const { error } = await supabase
                .from('products')
                .update({ sale_price: null })
                .in('id', Array.from(selectedProductIds));
    
            if (error) throw error;
    
            await fetchProducts();
            setSelectedProductIds(new Set());
            showToast('已移除特價設定', 'success');
        } catch (error: any) {
            console.error('Error removing discount:', error);
            showToast('移除失敗: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to get display URL
    const getDisplayUrl = (img: any) => {
        if (!img) return null;
        if (typeof img === 'string') {
            try {
                return JSON.parse(img).url || img;
            } catch {
                return img;
            }
        }
        return img.url;
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' 
            ? true 
            : filterType === 'on_sale' 
                ? !!p.sale_price 
                : !p.sale_price;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div className="text-center py-12">載入中...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" />
                        批量特價管理
                    </h2>
                    
                    <div className="flex items-center space-x-2">
                        <select
                            value={filterType}
                            onChange={(e: any) => setFilterType(e.target.value)}
                            className="border border-gray-300 rounded-md text-sm px-3 py-2"
                        >
                            <option value="all">所有產品</option>
                            <option value="on_sale">特價中</option>
                            <option value="no_sale">原價</option>
                        </select>
                        
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜尋產品..."
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0}
                                onChange={selectAll}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">全選本頁</span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                            已選 {selectedProductIds.size} 項
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex items-center">
                            <input
                                type="number"
                                placeholder="折扣"
                                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 pr-8"
                                value={bulkDiscount}
                                onChange={(e) => setBulkDiscount(e.target.value)}
                            />
                            <span className="absolute right-3 text-gray-500 text-sm">%</span>
                        </div>
                        <button
                            onClick={applyBulkDiscount}
                            disabled={selectedProductIds.size === 0 || !bulkDiscount}
                            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                                selectedProductIds.size === 0 || !bulkDiscount 
                                    ? 'bg-blue-300 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                            }`}
                        >
                            應用折扣
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-2"></div>
                        <button
                            onClick={removeBulkDiscount}
                            disabled={selectedProductIds.size === 0}
                            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                                selectedProductIds.size === 0 
                                    ? 'text-gray-400 border-gray-200 bg-gray-50' 
                                    : 'text-red-600 border-red-200 bg-white hover:bg-red-50'
                            }`}
                        >
                            移除特價
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                    選取
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    產品資訊
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    原價
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    特價 (Sale Price)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    折扣力度
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => {
                                const discountPercent = product.sale_price 
                                    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                                    : 0;

                                return (
                                    <tr key={product.id} className={`hover:bg-gray-50 ${selectedProductIds.has(product.id) ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedProductIds.has(product.id)}
                                                onChange={() => toggleSelection(product.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200">
                                                    {product.images && product.images.length > 0 && (
                                                        <img 
                                                            className="h-10 w-10 object-cover" 
                                                            src={getDisplayUrl(product.images[0])} 
                                                            alt="" 
                                                        />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            HK$ {product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.sale_price ? (
                                                <span className="text-sm font-bold text-red-600">
                                                    HK$ {product.sale_price}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {discountPercent > 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {discountPercent}% OFF
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">無折扣</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        沒有找到符合條件的產品
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        pendingOrders: 0,
        onSaleProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('is_deleted', false);

            // Fetch on sale products count
            const { count: onSaleCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('is_deleted', false)
                .not('sale_price', 'is', null);

            // Fetch orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('total_amount, status, created_at, shipping_address, id')
                .order('created_at', { ascending: false });
            
            if (ordersData) {
                const totalRevenue = ordersData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
                const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
                
                setStats({
                    totalRevenue,
                    totalOrders: ordersData.length,
                    totalProducts: productsCount || 0,
                    pendingOrders,
                    onSaleProducts: onSaleCount || 0
                });
                
                setRecentOrders(ordersData.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">載入數據中...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">總收入</p>
                            <h3 className="text-2xl font-bold text-gray-900">HK$ {stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">總訂單數</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-full">
                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">待處理訂單</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">上架產品</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">特價產品</p>
                            <h3 className="text-2xl font-bold text-red-600">{stats.onSaleProducts}</h3>
                        </div>
                        <div className="bg-red-50 p-3 rounded-full">
                            <Tag className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">最近訂單</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                        <div key={order.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-2 h-2 rounded-full ${
                                    order.status === 'paid' ? 'bg-blue-500' : 
                                    order.status === 'completed' ? 'bg-green-500' : 
                                    'bg-yellow-500'
                                }`} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {order.shipping_address?.lastName} {order.shipping_address?.firstName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">HK$ {order.total_amount}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    order.status === 'paid' ? 'bg-blue-100 text-blue-800' : 
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {order.status === 'paid' ? '已付款' : 
                                     order.status === 'completed' ? '已完成' : 
                                     order.status === 'pending' ? '待付款' : order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {recentOrders.length === 0 && (
                        <div className="p-8 text-center text-gray-500">暫無訂單</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProductManager = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.findIndex((img) => img.url === active.id);
        const newIndex = prev.images.findIndex((img) => img.url === over.id);
        
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };
  
  // Temporary state for new image input
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageColor, setNewImageColor] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category: '',
    series: '',
    images: [],
    stock_quantity: 100,
    variants: []
  });

  const [existingSeries, setExistingSeries] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>(['衛衣', '上衣', '外套', '褲子', '飾品']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortKey, setSortKey] = useState<'updated_at_desc' | 'created_at_desc' | 'price_asc' | 'stock_asc'>('updated_at_desc');

  useEffect(() => {
    fetchSeries();
    fetchCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [page, searchTerm, selectedSeriesFilter, selectedCategoryFilter, saleOnly, sortKey]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category');
      
      if (error) throw error;
      
      const uniqueCategories = Array.from(new Set(
        data
          ?.map(p => p.category)
          .filter((s): s is string => !!s)
      )).sort();
      
      // Merge with default categories and remove unwanted ones
      const merged = Array.from(new Set([...categoryList, ...uniqueCategories]))
        .filter(cat => cat !== 'hoodie') // Filter out 'hoodie'
        .sort();
      setCategoryList(merged);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('series');
      
      if (error) throw error;
      
      const uniqueSeries = Array.from(new Set(
        data
          ?.map(p => p.series)
          .filter((s): s is string => !!s)
      )).sort();
      
      setExistingSeries(uniqueSeries);
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };

  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const selectCols =
        'id,name,price,sale_price,images,stock_quantity,category,series,created_at,updated_at,is_deleted,product_variants(size,color,stock_quantity)';

      let query = supabase
        .from('products')
        .select(selectCols, { count: 'exact' });

      const term = searchTerm.trim();
      if (term.length > 0) {
        query = query.or(`name.ilike.%${term}%,series.ilike.%${term}%,category.ilike.%${term}%`);
      }

      if (selectedSeriesFilter !== 'all') {
        query = query.eq('series', selectedSeriesFilter);
      }

      if (selectedCategoryFilter !== 'all') {
        query = query.eq('category', selectedCategoryFilter);
      }

      if (saleOnly) {
        query = query.not('sale_price', 'is', null);
      }

      if (sortKey === 'updated_at_desc') query = query.order('updated_at', { ascending: false });
      if (sortKey === 'created_at_desc') query = query.order('created_at', { ascending: false });
      if (sortKey === 'price_asc') query = query.order('price', { ascending: true });
      if (sortKey === 'stock_asc') query = query.order('stock_quantity', { ascending: true });

      query = query.range(from, to);

      if (signal) query = query.abortSignal(signal);

      const { data, error, count } = await query;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
      setSelectedProductIds(new Set());
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        ('name' in error || 'message' in error) &&
        (((error as any).name === 'AbortError') || String((error as any).message || '').includes('AbortError'))
      ) {
        return;
      }
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingId(product.id);
    setShowForm(true); // Show form when editing
    
    // Parse images to ensure they are in the correct format
    let parsedImages: ProductImage[] = [];
    if (product.images) {
      parsedImages = product.images.map((img: any) => {
        if (typeof img === 'string') {
          try {
            const parsed = JSON.parse(img);
            return { url: parsed.url || img, color: parsed.color };
          } catch {
            return { url: img };
          }
        }
        return img;
      });
    }

    // Fetch variants
    let variants: any[] = [];
    try {
        const { data } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', product.id);
        if (data) {
            variants = data.map(v => ({
                size: v.size,
                color: v.color,
                stock_quantity: v.stock_quantity
            }));
        }
    } catch (e) {
        console.error("Error fetching variants", e);
    }

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      category: product.category,
      series: product.series || 'Classic Collection',
      images: parsedImages,
      stock_quantity: product.stock_quantity,
      variants: variants
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false); // Hide form on cancel
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      category: '',
      series: '',
      images: [],
      stock_quantity: 100,
      variants: []
    });
    setNewImageUrl('');
    setNewImageColor('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setNewImageUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showToast('圖片上傳失敗: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const addImage = () => {
    if (!newImageUrl) return;
    
    const newImage: ProductImage = {
      url: newImageUrl,
      color: newImageColor || undefined
    };

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));

    setNewImageUrl('');
    setNewImageColor('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageColor = (index: number, newColor: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], color: newColor };
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate total stock if variants exist特價 (Sale Price) (HK$)
      const totalStock = formData.variants.length > 0 
        ? formData.variants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0)
        : formData.stock_quantity;

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        category: formData.category,
        series: formData.series,
        stock_quantity: totalStock,
        images: formData.images,
        sizes: ['S', 'M', 'L', 'XL'],
        // Extract unique colors from images for the colors array
        colors: Array.from(new Set(formData.images.map(img => img.color).filter(Boolean)))
      };

      let error;
      let savedProductId = editingId;
      
      if (editingId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        error = updateError;
      } else {
        // If no images provided, add a default placeholder one
        if (productData.images.length === 0) {
           const defaultUrl = `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.name + ' hoodie fashion')}&image_size=square`;
           productData.images = [{ url: defaultUrl }];
        }
        
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        error = insertError;
        if (newProduct) {
            savedProductId = newProduct.id;
        }
      }

      if (error) throw error;

      // Save Variants
      if (savedProductId) {
        // 1. Always delete existing variants first.
        // This ensures that if the user removed all variants in the UI, they are removed from the DB.
        const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', savedProductId);
            
        if (deleteError) {
            console.error('Error deleting old variants:', deleteError);
            // Don't throw here, just log, as product is already saved
        }

        // 2. Insert new variants if any exist
        if (formData.variants.length > 0) {
            const variantsToInsert = formData.variants.map(v => ({
                product_id: savedProductId,
                size: v.size,
                color: v.color,
                stock_quantity: v.stock_quantity
            }));
            
            const { error: variantError } = await supabase
                .from('product_variants')
                .insert(variantsToInsert);
                
            if (variantError) throw variantError;
        }
      }

      cancelEdit();
      fetchProducts();
      showToast(editingId ? '產品已更新！' : '產品已添加！', 'success');
      setShowForm(false); // Close form on success
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast('儲存失敗: ' + (error.message || 'Unknown error'), 'error');
    }
  };

  const handleSoftDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Soft delete - moves to recycle bin without blocking confirmation
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
      
      if (editingId === id) {
        cancelEdit();
      }
      await fetchProducts();
      showToast('已移至回收筒', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('移動到回收筒失敗', 'error');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_deleted: false })
        .eq('id', id);

      if (error) throw error;
      await fetchProducts();
      showToast('產品已還原', 'success');
    } catch (error) {
      console.error('Error restoring product:', error);
      showToast('還原失敗', 'error');
    }
  };

  const handlePermanentDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Force a synchronous confirmation dialog
    const isConfirmed = window.confirm(`確定要永久刪除 "${name}" 嗎？此操作無法復原。`);

    if (isConfirmed) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchProducts();
        showToast('產品已永久刪除', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('刪除失敗', 'error');
      }
    }
  };

  // Bulk Action Handlers
  // Removed bulk action handlers from ProductManager as they are now in OnSaleManager
  /*
  const toggleProductSelection = (id: string) => {
    // ...
  };
  ...
  */

  // Helper to get display URL for list
  const getDisplayUrl = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') {
        try {
            return JSON.parse(img).url || img;
        } catch {
            return img;
        }
    }
    return img.url;
  };

  const toggleSelection = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSeriesFilter('all');
    setSelectedCategoryFilter('all');
    setSaleOnly(false);
    setSortKey('updated_at_desc');
    setPage(1);
  };

  const availableColors = Array.from(new Set(formData.images.map(img => img.color).filter(Boolean)));

  return (
    <div>
      {/* Add/Edit Product Header */}
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-gray-800">產品管理</h2>
         {!showForm && (
            <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors flex items-center shadow-sm"
            >
                <Plus className="w-5 h-5 mr-2" />
                新增產品
            </button>
         )}
      </div>

      {/* Add/Edit Product Form */}
      {showForm && (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center text-gray-800">
            {editingId ? <Edit className="w-5 h-5 mr-2 text-blue-600" /> : <Plus className="w-5 h-5 mr-2 text-green-600" />}
            {editingId ? '編輯產品' : '新增產品'}
            </h2>
            <button 
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">產品名稱</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="例如: 經典Logo衛衣"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">價格 (HK$)</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="299"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">特價 (Sale Price) (HK$)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md p-2 bg-red-50"
                value={formData.sale_price}
                onChange={e => setFormData({...formData, sale_price: e.target.value})}
                placeholder="如無特價請留空"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">系列 <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.series}
                onChange={e => setFormData({...formData, series: e.target.value})}
              >
                <option value="" disabled>選擇現有系列</option>
                {existingSeries.map(series => (
                  <option key={series} value={series}>
                    {series === 'Football Collection' ? '港足系列' : (series === 'Other' ? '其他' : series)}
                  </option>
                ))}
                {!existingSeries.includes('Classic Collection') && <option value="Classic Collection">Classic Collection</option>}
                {!existingSeries.includes('Football Collection') && <option value="Football Collection">港足系列</option>}
                {!existingSeries.includes('Other') && <option value="Other">其他</option>}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類 <span className="text-red-500">*</span></label>
              <select
                required
                className="w-full border border-gray-300 rounded-md p-2"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled>選擇分類</option>
                {categoryList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">產品描述 (選填)</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="輸入產品詳細描述..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">產品圖片與顏色</label>
            
            {/* Image List */}
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={formData.images.map(img => img.url)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img, idx) => (
                            <SortableImage 
                                key={img.url} 
                                img={img} 
                                idx={idx} 
                                onRemove={removeImage} 
                                onUpdateColor={updateImageColor}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add New Image Section */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">新增圖片</h4>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 flex items-center hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700">{uploading ? '上傳中...' : '上傳圖片'}</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        </label>
                        <span className="text-xs text-gray-500">或</span>
                        <div className="flex-1 flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white">
                            <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <input
                                type="url"
                                className="flex-1 text-sm outline-none"
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                placeholder="輸入圖片連結..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                         <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                            value={newImageColor}
                            onChange={e => setNewImageColor(e.target.value)}
                            placeholder="輸入顏色名稱 (例如: 紅色, 黑色)..."
                        />
                        <button
                            type="button"
                            onClick={addImage}
                            disabled={!newImageUrl}
                            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${!newImageUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            <Plus className="w-4 h-4 inline mr-1" />
                            加入列表
                        </button>
                    </div>
                </div>
            </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">庫存數量 {formData.variants.length > 0 && <span className="text-xs font-normal text-gray-500">(由規格總和計算)</span>}</label>
              <input
                type="number"
                required
                min="0"
                className={`w-full border border-gray-300 rounded-md p-2 ${formData.variants.length > 0 ? 'bg-gray-100 text-gray-500' : ''}`}
                value={formData.variants.length > 0 ? formData.variants.reduce((sum, v) => sum + v.stock_quantity, 0) : formData.stock_quantity}
                onChange={e => {
                    if (formData.variants.length === 0) {
                        setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0});
                    }
                }}
                placeholder="100"
                disabled={formData.variants.length > 0}
              />
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-700">產品規格與庫存 (多規格)</h3>
                    <button
                        type="button"
                        onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                variants: [...prev.variants, { size: '', color: '', stock_quantity: 0 }]
                            }));
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                        + 新增規格
                    </button>
                </div>
                
                {formData.variants.length > 0 ? (
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium mb-1 px-1">
                            <div className="col-span-3">尺碼</div>
                            <div className="col-span-4">顏色</div>
                            <div className="col-span-4">庫存</div>
                            <div className="col-span-1"></div>
                        </div>
                        {formData.variants.map((variant, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-gray-100">
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        placeholder="S, M..."
                                        value={variant.size}
                                        onChange={e => {
                                            const newVariants = [...formData.variants];
                                            newVariants[idx].size = e.target.value;
                                            setFormData({...formData, variants: newVariants});
                                        }}
                                        className="w-full border border-gray-300 rounded p-1 text-sm"
                                    />
                                </div>
                                <div className="col-span-4">
                                     <select
                                        value={variant.color}
                                        onChange={e => {
                                            const newVariants = [...formData.variants];
                                            newVariants[idx].color = e.target.value;
                                            setFormData({...formData, variants: newVariants});
                                        }}
                                        className="w-full border border-gray-300 rounded p-1 text-sm bg-white"
                                    >
                                        <option value="" disabled>選擇顏色</option>
                                        {availableColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                        {!availableColors.includes(variant.color) && variant.color && (
                                            <option value={variant.color}>{variant.color}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="number"
                                        min="0"
                                        value={variant.stock_quantity}
                                        onChange={e => {
                                            const newVariants = [...formData.variants];
                                            newVariants[idx].stock_quantity = parseInt(e.target.value) || 0;
                                            setFormData({...formData, variants: newVariants});
                                        }}
                                        className="w-full border border-gray-300 rounded p-1 text-sm"
                                    />
                                </div>
                                <div className="col-span-1 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newVariants = formData.variants.filter((_, i) => i !== idx);
                                            setFormData({...formData, variants: newVariants});
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 text-center py-4 bg-white rounded border border-dashed border-gray-300">
                        暫無規格。點擊上方按鈕添加不同尺碼/顏色的庫存。
                        <br/>
                        (如不添加，將使用上方總庫存數量)
                    </p>
                )}
            </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
            >
              {editingId ? '更新產品' : '發布產品'}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between w-full gap-3">
            <h2 className="text-xl font-bold">產品 ({totalCount})</h2>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={() => fetchProducts()}
                className="text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                重新載入
              </button>
              <button
                onClick={clearFilters}
                className="text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                清除篩選
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full">
             <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="搜尋產品名稱/分類/系列"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
             </div>

             <button
                onClick={() => {
                  setSaleOnly((v) => !v);
                  setPage(1);
                }}
                className={`flex items-center whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                  saleOnly ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
             >
                <Tag className="w-4 h-4 mr-2" />
                只顯示特價
             </button>

             <select
                value={selectedSeriesFilter}
                onChange={(e) => {
                  setSelectedSeriesFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
             >
                <option value="all">所有系列</option>
                {existingSeries.map(series => (
                  <option key={series} value={series}>
                    {series === 'Football Collection' ? '港足系列' : (series === 'Other' ? '其他' : series)}
                  </option>
                ))}
                 {!existingSeries.includes('Classic Collection') && <option value="Classic Collection">Classic Collection</option>}
                {!existingSeries.includes('Football Collection') && <option value="Football Collection">港足系列</option>}
                {!existingSeries.includes('Other') && <option value="Other">其他</option>}
             </select>

             <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
             >
                <option value="all">所有分類</option>
                {categoryList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>

             <select
               value={sortKey}
               onChange={(e) => {
                 setSortKey(e.target.value as any);
                 setPage(1);
               }}
               className="border border-gray-300 rounded-md text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
             >
               <option value="updated_at_desc">最新更新</option>
               <option value="created_at_desc">最新新增</option>
               <option value="price_asc">價錢（低→高）</option>
               <option value="stock_asc">庫存（低→高）</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" disabled />
                </th>
                <th className="px-4 py-3">商品</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">庫存</th>
                <th className="px-4 py-3">類別</th>
                <th className="px-4 py-3">系列</th>
                <th className="px-4 py-3">價錢</th>
                <th className="px-4 py-3">更新</th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-4 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-4"></td>
                  </tr>
                ))
              )}

              {!loading && products.map((product) => {
                const imgUrl = product.images && product.images.length > 0 ? getDisplayUrl(product.images[0]) : null;
                const selected = selectedProductIds.has(product.id);
                const stockTotal =
                  product.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || product.stock_quantity;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(product)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selected}
                        onChange={() => toggleSelection(product.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shrink-0">
                          {imgUrl && <img src={imgUrl} alt={product.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.is_deleted ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.is_deleted ? '停用' : '啟用'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`${stockTotal < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                        {stockTotal}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{product.category}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {product.series === 'Football Collection' ? '港足系列' : (product.series === 'Other' ? '其他' : product.series)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`${product.sale_price ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                          HK$ {product.price}
                        </span>
                        {product.sale_price && <span className="text-red-600 font-bold">HK$ {product.sale_price}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {product.updated_at ? new Date(product.updated_at).toLocaleDateString('zh-HK') : '-'}
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-md transition-colors"
                          title="編輯"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!product.is_deleted ? (
                          <button
                            onClick={(e) => handleSoftDelete(e, product.id, product.name)}
                            className="text-gray-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="停用"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(product.id)}
                            className="text-gray-500 hover:text-green-700 p-2 hover:bg-green-50 rounded-md transition-colors"
                            title="啟用"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-500">
                    沒有符合條件的商品
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {totalCount === 0 ? '共 0 件' : (() => {
              const from = (page - 1) * pageSize + 1;
              const to = Math.min(page * pageSize, totalCount);
              return `顯示 ${from}-${to} / 共 ${totalCount} 件`;
            })()}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一頁
            </button>
            <div className="text-sm text-gray-700">
              第 {page} 頁
            </div>
            <button
              className="text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || page * pageSize >= totalCount}
              onClick={() => setPage((p) => p + 1)}
            >
              下一頁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderManager = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (
                            name,
                            images
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders(); // Refresh list
            showToast('訂單狀態已更新', 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('更新狀態失敗', 'error');
        }
    };

    if (loading) {
        return <div className="text-center py-12">載入訂單中...</div>;
    }

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        return order.status === statusFilter;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold">訂單列表 ({filteredOrders.length})</h2>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md overflow-x-auto max-w-full">
                    {['all', 'pending', 'paid', 'shipped', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                                statusFilter === status 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {status === 'all' ? '全部' :
                             status === 'pending' ? '待付款' :
                             status === 'paid' ? '已付款' :
                             status === 'shipped' ? '已發貨' :
                             status === 'completed' ? '已完成' : '已取消'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="p-6">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500">訂單編號: <span className="font-mono text-gray-900">{order.id}</span></p>
                                <p className="text-sm text-gray-500">下單時間: {new Date(order.created_at).toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    收件人: <span className="font-medium text-gray-900">{order.shipping_address?.lastName} {order.shipping_address?.firstName}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    電話: {order.shipping_address?.phone}
                                </p>
                                <p className="text-sm text-gray-500">地址: {order.shipping_address?.address}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <p className="text-lg font-bold text-gray-900">HK$ {order.total_amount}</p>
                                <div className="mt-2">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className={`text-sm border rounded-md p-1 font-medium ${
                                            order.status === 'pending' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                                            order.status === 'paid' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                            order.status === 'shipped' ? 'text-purple-600 border-purple-200 bg-purple-50' :
                                            order.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' :
                                            'text-gray-600 border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <option value="pending">待付款</option>
                                        <option value="paid">已付款</option>
                                        <option value="shipped">已發貨</option>
                                        <option value="completed">已完成</option>
                                        <option value="cancelled">已取消</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-md p-4">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">訂單內容</h4>
                            <div className="space-y-3">
                                {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900">{item.products?.name || '未知產品'}</span>
                                            <span className="mx-2 text-gray-400">-</span>
                                            <span className="text-gray-600">{item.selected_size}</span>
                                            <span className="mx-2 text-gray-400">x</span>
                                            <span className="font-medium text-gray-900">{item.quantity}</span>
                                        </div>
                                        <span className="text-gray-600">HK$ {item.unit_price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        {statusFilter === 'all' ? '暫無訂單記錄' : '此狀態下暫無訂單'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
