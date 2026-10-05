// src/pages/ConversationsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bell, ArrowRight } from 'lucide-react';

import SmsTab from '../features/conversations/components/SmsTab';

const TABS = [
  { id: 'sms', label: 'پیامک‌ها', icon: MessageSquare },
  { id: 'notifications', label: 'نوتیفیکیشن‌ها', icon: Bell, disabled: true },
];

const ConversationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sms');

  return (
    <div
      className="h-full flex flex-col bg-gray-50 font-vazir overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            گفتگو
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="
            hidden md:flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-white border border-gray-200
            text-slate-700 text-xs font-semibold
            hover:bg-gray-50 transition-colors
            cursor-pointer
          "
        >
          <ArrowRight size={14} />
          بازگشت به داشبورد
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
                ${
                  tab.disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
              title={tab.disabled ? 'به‌زودی' : undefined}
            >
              <Icon size={15} />
              {tab.label}
              {tab.disabled && (
                <span className="text-[9px] font-normal bg-gray-100 px-1.5 py-0.5 rounded">
                  به‌زودی
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'sms' && <SmsTab />}
        {activeTab === 'notifications' && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            نوتیفیکیشن‌ها به‌زودی...
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;