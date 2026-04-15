import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">關於 HUGO WOOD</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700 leading-relaxed">
        <p>
          HUGO WOOD 致力於為您提供最舒適、時尚的衛衣選擇。我們的設計理念源於對日常穿搭的極致追求，
          將簡約美學與高品質面料完美結合。
        </p>
        
        <p>
          每一件 HUGO WOOD 的產品都經過精心打磨，從選料到剪裁，我們注重每一個細節，
          只為讓您感受到與眾不同的穿著體驗。無論是休閒出遊還是日常通勤，
          HUGO WOOD 都是您不可或缺的時尚夥伴。
        </p>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-900">品牌願景</h2>
          <p>
            我們希望通過服裝傳遞自信與舒適的生活態度，讓每個人都能在 HUGO WOOD 找到屬於自己的風格語言。
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
