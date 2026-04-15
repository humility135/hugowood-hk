const SiteBuilder = ({ showToast }: { showToast: (msg: string, type: ToastType) => void }) => {
    const { sections, updateSection, globalSettings, updateGlobalSettings, resetToDefault } = useSiteStore();
    const [uploading, setUploading] = useState(false);

    // Image Cropping State
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);
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
                                                        reader.addEventListener('load', () => setCropImageSrc(reader.result?.toString() || null));
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
                                                            <input type="text" value={slide.image} onChange={(e) => {
                                                                const updatedSlides = [...section.content.slides];
                                                                updatedSlides[slideIndex].image = e.target.value;
                                                                updateSection(section.id, { content: { ...section.content, slides: updatedSlides } });
                                                            }} className="w-full text-xs rounded border-gray-300 shadow-sm" />
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
                                            const filePath = `logo-${Math.random()}.${fileExt}`;
                                            const file = new File([blob], filePath, { type: 'image/png' });
                                            const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
                                            if (uploadError) throw uploadError;
                                            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                                            updateGlobalSettings({ siteIdentity: { ...globalSettings.siteIdentity, logoUrl: data.publicUrl } });
                                            showToast('Logo 裁切並上傳成功', 'success');
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
