'use client';

import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { ContentManagementData, ContentBanner, FaqItem } from '@/lib/types';

interface ContentViewProps {
  content: ContentManagementData;
  onUpdateContent: (updated: Partial<ContentManagementData>) => Promise<void>;
  onRefresh: () => void;
}

export default function ContentView({
  content,
  onUpdateContent,
  onRefresh,
}: ContentViewProps) {
  const [activeTab, setActiveTab] = useState<'banners' | 'faqs' | 'policies' | 'about'>('banners');
  const [aboutText, setAboutText] = useState(content.aboutUsText);
  const [helpline, setHelpline] = useState(content.supportHelpline);
  const [supportEmail, setSupportEmail] = useState(content.supportEmail);
  const [terms, setTerms] = useState(content.termsAndConditions);
  const [privacy, setPrivacy] = useState(content.privacyPolicy);
  const [cancellation, setCancellation] = useState(content.cancellationPolicy);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveTextContent = async () => {
    setIsSaving(true);
    await onUpdateContent({
      aboutUsText: aboutText,
      supportHelpline: helpline,
      supportEmail: supportEmail,
      termsAndConditions: terms,
      privacyPolicy: privacy,
      cancellationPolicy: cancellation,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'banners' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Homepage Banners ({content.banners.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'faqs' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Frequently Asked Questions ({content.faqs.length})
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'policies' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tenant Policies & Terms
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'about' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            About Us & Support Desk
          </button>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Content published successfully
          </span>
        )}
      </div>

      {/* Tab 1: Homepage Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.banners.map((banner, index) => (
              <div key={banner.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                <div>
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                        {banner.category} · {banner.city}
                      </span>
                      <span className={`text-[10px] font-bold ${banner.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {banner.isActive ? 'Active on Portal' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{banner.title}</h3>
                    <p className="text-xs text-slate-500">{banner.subtitle}</p>
                    <div className="pt-2 text-[11px] text-blue-600 font-semibold">
                      CTA: {banner.ctaText} → {banner.ctaLink}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: FAQs */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Published FAQs for Tenants & Hosts
            </h3>
          </div>
          <div className="space-y-3">
            {content.faqs.map(faq => (
              <div key={faq.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700 font-semibold">
                    {faq.category}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tenant Policies & Legal Terms */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Cancellation & Refund Policy (Mandatory Display on Booking Checkout):
            </label>
            <textarea
              rows={3}
              value={cancellation}
              onChange={e => setCancellation(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Terms & Tenancy Conditions (Peflarmo Resident Charter):
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={e => setTerms(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Privacy Policy (DPDP Act 2023 Compliance):
            </label>
            <textarea
              rows={3}
              value={privacy}
              onChange={e => setPrivacy(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleSaveTextContent}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Policies'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: About Us & Support Info */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              About Peflarmo Platform (Public Mission Statement):
            </label>
            <textarea
              rows={3}
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Support Helpline Number:
              </label>
              <input
                type="text"
                value={helpline}
                onChange={e => setHelpline(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Official Support Email:
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={handleSaveTextContent}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Company Details'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
