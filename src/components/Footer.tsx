
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../lib/store';

const Footer = () => {
  const { globalSettings } = useSiteStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/">
                {globalSettings?.siteIdentity?.logoUrl ? (
                    <img 
                        src={globalSettings.siteIdentity.logoUrl} 
                        alt={globalSettings.siteIdentity.siteName} 
                        className="object-contain mb-4"
                        style={{ height: `${globalSettings?.siteIdentity?.logoSize ? globalSettings.siteIdentity.logoSize * 0.6 : 48}px` }}
                    />
                ) : (
                    <h3 className="text-xl font-black tracking-widest mb-4 text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {globalSettings?.siteIdentity?.siteName || "HUGOWOOD"}
                    </h3>
                )}
            </Link>
            <p className="text-gray-400 text-sm">
                {globalSettings?.footer?.description || "為您提供最舒適時尚的服飾選擇，展現獨特個人風格。"}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">關於我們</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">品牌故事</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">聯絡我們</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">隱私政策</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white transition-colors">條款與細則</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">客戶服務</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/delivery" className="hover:text-white transition-colors">配送及運送</Link></li>
              <li><Link to="/service-policy" className="hover:text-white transition-colors">服務條款</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">追蹤我們</h4>
            <div className="flex space-x-4">
              {globalSettings?.footer?.social?.instagram && (
                <a href={globalSettings.footer.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06h.63zm2.595 14.595a2.595 2.595 0 100-5.19 2.595 2.595 0 000 5.19zm-1.25-4.39a1.41 1.41 0 110 2.82 1.41 1.41 0 010-2.82zm-1.345-4.39a4.995 4.995 0 01-4.995 4.995 4.995 4.995 0 01-4.995-4.995 4.995 4.995 0 014.995-4.995 4.995 4.995 0 014.995 4.995z" clipRule="evenodd" />
                    </svg>
                </a>
              )}
              {globalSettings?.footer?.social?.facebook && (
                <a href={globalSettings.footer.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {year} {globalSettings?.footer?.copyrightText || "HUGOWOOD. All rights reserved."}
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
             {/* Payment Icons or additional small links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
