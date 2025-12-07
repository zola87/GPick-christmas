import React from 'react';
import { RULES_CONTENT } from '../constants';

const RulesSection: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto mt-8 mb-24 px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 border-green-700/20 text-gray-800">
        <h2 className="text-xl font-bold text-center mb-6 text-red-700 flex items-center justify-center gap-2">
          <span>🎅</span> GPICK 聖誕連線・活動辦法
        </h2>

        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          {/* Method */}
          <div>
            <h3 className="font-bold text-green-800 mb-2 border-b-2 border-green-100 pb-1">
              📝 如何參加：
            </h3>
            <ul className="space-y-2 pl-1">
              {RULES_CONTENT.method.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="font-bold text-red-600 flex-shrink-0">{idx + 1}.</span>
                  <span>
                    <span className="font-bold text-gray-900">{item.title}：</span>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notices */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-2">
              ⚠️ 注意事項 (必讀)：
            </h3>
            <ul className="space-y-2 list-disc pl-4 marker:text-red-400">
              {RULES_CONTENT.notices.map((item, idx) => (
                <li key={idx}>
                  <span className="font-bold text-gray-900">{item.title}：</span>
                  <span className={item.highlight ? "text-red-600 font-bold underline decoration-red-300 decoration-2 underline-offset-2" : ""}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesSection;