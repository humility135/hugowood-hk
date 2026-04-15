import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Slide {
  id: string;
  image: string;
  subtitle: string;
  title: string; // HTML string or plain text
  description: string;
  link: string;
}

export interface Section {
  id: string;
  type: 'hero' | 'products-grid' | 'banner' | 'features';
  title?: string; // For section header
  content: any; // Flexible content based on type
  isVisible: boolean;
}

export interface GlobalSettings {
  siteIdentity: {
    siteName: string;
    logoUrl?: string; // Optional image logo
    logoSize?: number; // Optional size in pixels
  };
  announcement: {
    text: string;
    isVisible: boolean;
    link?: string;
  };
  footer: {
    description: string;
    copyrightText: string;
    social: {
      instagram?: string;
      facebook?: string;
    };
  };
}

interface SiteConfigState {
  globalSettings: GlobalSettings;
  sections: Section[];
  updateGlobalSettings: (settings: Partial<GlobalSettings> | Partial<GlobalSettings['announcement']> | Partial<GlobalSettings['siteIdentity']> | Partial<GlobalSettings['footer']>) => void;
  updateSection: (id: string, newContent: Partial<Section>) => void;
  reorderSections: (newOrder: Section[]) => void;
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  resetToDefault: () => void;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteIdentity: {
    siteName: "HUGOWOOD",
    logoSize: 80, // Default to 80px
  },
  announcement: {
    text: "全館滿 $500 免運費 | 新會員首單 9 折優惠",
    isVisible: true,
    link: "/products"
  },
  footer: {
    description: "為您提供最舒適時尚的服飾選擇，展現獨特個人風格。",
    copyrightText: "HUGOWOOD. All rights reserved.",
    social: {
      instagram: "https://www.instagram.com/hugowood.hk/",
      facebook: "#"
    }
  }
};

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'hero-main',
    type: 'hero',
    isVisible: true,
    content: {
      slides: [
        {
          id: 'slide-1',
          image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=high%20fashion%20editorial%20shot%2C%20minimal%20streetwear%20aesthetic%2C%20moody%20lighting%2C%20dark%20blue%20and%20charcoal%20tones%2C%20ultra%20realistic%2C%20cinematic%20depth%20of%20field%2C%20vogue%20magazine%20style&image_size=landscape_16_9",
          subtitle: "Hugo Wood Collection",
          title: "探索極致舒適<br/>定義自我風格",
          description: "精選高品質服飾，為您的日常穿搭注入活力。\n限時優惠，全館滿額免運。",
          link: "/products"
        },
        {
          id: 'slide-2',
          image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20street%20style%20fashion%20photography%2C%20model%20wearing%20oversized%20hoodie%2C%20tokyo%20night%20city%20lights%20background%2C%20neon%20cyan%20and%20magenta%20lighting%2C%20cinematic%20look&image_size=landscape_16_9",
          subtitle: "New Arrivals",
          title: "城市機能美學<br/>引領街頭潮流",
          description: "全新機能系列上架，融合科技與時尚。\n打造專屬於您的都市探險裝備。",
          link: "/products?category=外套"
        }
      ]
    }
  },
  {
    id: 'new-arrivals',
    type: 'products-grid',
    title: 'NEW ARRIVAL',
    isVisible: true,
    content: {
      source: 'new_arrivals',
      limit: 4
    }
  },
  {
    id: 'trending',
    type: 'products-grid',
    title: 'HOT SALE',
    isVisible: true,
    content: {
      source: 'trending',
      limit: 4
    }
  },
  {
    id: 'features-main',
    type: 'features',
    title: '服務特色',
    isVisible: true,
    content: {
      items: [
        {
          id: 'feature-1',
          icon: 'shield', // using string for icon name
          title: '品質保證',
          description: '嚴選優質面料，舒適耐穿'
        },
        {
          id: 'feature-2',
          icon: 'truck',
          title: '快速出貨',
          description: '現貨商品 24 小時內出貨'
        },
        {
          id: 'feature-3',
          icon: 'refresh-cw',
          title: '退換無憂',
          description: '7 天鑑賞期，購物有保障'
        }
      ]
    }
  }
];

export const useSiteStore = create<SiteConfigState>()(
  persist(
    (set) => ({
      globalSettings: DEFAULT_GLOBAL_SETTINGS,
      sections: DEFAULT_SECTIONS,
      updateGlobalSettings: (settings) =>
        set((state) => {
            const currentSettings = state.globalSettings || DEFAULT_GLOBAL_SETTINGS;
            const newSettings = { ...currentSettings };
            
            if (settings.siteIdentity) {
                newSettings.siteIdentity = { 
                    ...(currentSettings.siteIdentity || DEFAULT_GLOBAL_SETTINGS.siteIdentity), 
                    ...settings.siteIdentity 
                };
            }
            if (settings.announcement) {
                newSettings.announcement = { 
                    ...(currentSettings.announcement || DEFAULT_GLOBAL_SETTINGS.announcement), 
                    ...settings.announcement 
                };
            }
            if (settings.footer) {
                newSettings.footer = { 
                    ...(currentSettings.footer || DEFAULT_GLOBAL_SETTINGS.footer), 
                    ...settings.footer 
                };
                if (settings.footer.social) {
                    newSettings.footer.social = {
                        ...(currentSettings.footer?.social || DEFAULT_GLOBAL_SETTINGS.footer.social),
                        ...settings.footer.social
                    };
                }
            }
            
            return { globalSettings: newSettings };
        }),
      updateSection: (id, newContent) =>
        set((state) => ({
          sections: state.sections.map((sec) =>
            sec.id === id ? { ...sec, ...newContent } : sec
          ),
        })),
      reorderSections: (newOrder) => set({ sections: newOrder }),
      addSection: (section) => set((state) => ({ sections: [...state.sections, section] })),
      removeSection: (id) =>
        set((state) => ({ sections: state.sections.filter((s) => s.id !== id) })),
      resetToDefault: () => set({ sections: DEFAULT_SECTIONS, globalSettings: DEFAULT_GLOBAL_SETTINGS }),
    }),
    {
      name: 'site-config-storage',
    }
  )
);
