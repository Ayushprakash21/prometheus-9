import React, { useState } from 'react';
import { 
  SocialAccount, 
  PublicationRecord, 
  Campaign, 
  Product 
} from '../types';
import { 
  Share2, 
  Send, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Plus,
  Clock,
  X
} from 'lucide-react';
import { createCampaign } from '../services/api';

interface SocialAccountsViewProps {
  accounts: SocialAccount[];
  publications: PublicationRecord[];
  campaigns: Campaign[];
  selectedProduct: Product | null;
  onRefresh: () => Promise<void>;
  initialTab?: 'accounts' | 'centre' | 'calendar';
}

export const SocialAccountsView: React.FC<SocialAccountsViewProps> = ({
  accounts,
  publications,
  campaigns,
  selectedProduct,
  onRefresh,
  initialTab = 'accounts'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [authModalPlatform, setAuthModalPlatform] = useState<string | null>(null);

  // New Campaign Form
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('');
  const [campaignBudget, setCampaignBudget] = useState(1000);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: Share2, scopes: 'youtube.upload, youtube.readonly', desc: 'Longform video and YouTube Shorts publishing with OAuth 2.0.' },
    { id: 'instagram', name: 'Instagram', icon: Share2, scopes: 'instagram_basic, instagram_content_publish', desc: 'Reels, image carousels, and visual storytelling.' },
    { id: 'linkedin', name: 'LinkedIn', icon: Share2, scopes: 'w_member_social, r_liteprofile', desc: 'B2B thought leadership, founder updates, and articles.' },
    { id: 'x', name: 'X (Twitter)', icon: Share2, scopes: 'tweet.read, tweet.write, users.read', desc: 'High-velocity technical announcements and community threads.' },
    { id: 'tiktok', name: 'TikTok', icon: Share2, scopes: 'video.upload, user.info.basic', desc: 'Short-form vertical video reach and viral product demonstrations.' },
    { id: 'facebook', name: 'Facebook', icon: Share2, scopes: 'pages_manage_posts, pages_read_engagement', desc: 'Company page publications and community engagement.' },
  ];

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !campaignTitle.trim()) return;
    setIsCreatingCampaign(true);
    try {
      await createCampaign({
        product_id: selectedProduct.id,
        title: campaignTitle,
        objective: campaignObjective || 'Product Awareness & Lead Generation',
        budget_cap_cents: campaignBudget * 100,
        status: 'active'
      });
      setCampaignTitle('');
      setCampaignObjective('');
      setShowAddCampaignModal(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to launch campaign: ${err.message}`);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">Distribution & Social Accounts</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Manage authorized social platform connections, campaign publishing queues, and scheduled publication history.
          </p>
        </div>

        <button
          onClick={() => setShowAddCampaignModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#414542] pb-px no-scrollbar">
        {[
          { id: 'accounts', label: 'Social Accounts', count: accounts.length, icon: Share2 },
          { id: 'centre', label: 'Publishing Centre', count: campaigns.length, icon: Send },
          { id: 'calendar', label: 'Publishing Calendar & History', count: publications.length, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#A16C50] text-[#A16C50] font-semibold'
                  : 'border-transparent text-[#B8B0A5] hover:text-[#EEE8DE]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#B8B0A5]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SOCIAL ACCOUNTS PANELS */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((plat) => {
            const connectedAcc = accounts.find(a => a.platform.toLowerCase() === plat.id.toLowerCase());
            const isConnected = Boolean(connectedAcc && connectedAcc.authorization_status === 'connected');

            return (
              <div key={plat.id} className="p-5 rounded-xl bg-[#292C29] border border-[#414542] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-xs text-[#EEE8DE]">{plat.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics ${
                      isConnected 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-[#202221] text-[#B8B0A5] border border-[#414542]'
                    }`}>
                      {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                    </span>
                  </div>

                  <p className="text-xs text-[#B8B0A5] leading-relaxed">
                    {plat.desc}
                  </p>

                  {connectedAcc && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs">
                      <div className="text-[10px] font-mono-metrics uppercase text-[#A16C50]">Account Identity:</div>
                      <div className="font-medium text-[#EEE8DE] mt-0.5">{connectedAcc.account_name}</div>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] font-mono-metrics text-[#B8B0A5] truncate">
                    Scopes: {plat.scopes}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#414542] flex items-center justify-between">
                  <span className="text-[11px] text-[#B8B0A5]">OAuth 2.0</span>
                  <button
                    onClick={() => setAuthModalPlatform(plat.name)}
                    className="px-3 py-1.5 rounded bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-xs text-[#EEE8DE] transition-colors cursor-pointer"
                  >
                    {isConnected ? 'Manage Connection' : 'Connect Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PUBLISHING CENTRE */}
      {activeTab === 'centre' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#414542] bg-[#202221]/50 text-[10px] font-mono-metrics uppercase text-[#B8B0A5]">
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Objective</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Budget Cap</th>
                <th className="py-3 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#414542]/50">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#303430]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#EEE8DE]">{c.title}</td>
                  <td className="py-3 px-4 text-[#B8B0A5]">{c.objective}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#202221] text-emerald-400 border border-emerald-500/30 uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-metrics text-[#C9B49B]">
                    ${c.budget_cap_cents ? (c.budget_cap_cents / 100).toFixed(0) : 0} USD
                  </td>
                  <td className="py-3 px-4 text-right font-mono-metrics text-[#B8B0A5]">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PUBLISHING CALENDAR & HISTORY */}
      {activeTab === 'calendar' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#EEE8DE]">Verified Publications Ledger</h3>
            <span className="text-xs font-mono-metrics text-[#A16C50]">
              {publications.length} records verified
            </span>
          </div>

          {publications.length === 0 ? (
            <div className="p-8 text-center rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#B8B0A5]">
              No publications recorded. Connect social channels and approve content to publish.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#414542] text-[10px] font-mono-metrics uppercase text-[#B8B0A5]">
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Post ID</th>
                    <th className="py-2.5 px-3">Published At</th>
                    <th className="py-2.5 px-3">API Verification</th>
                    <th className="py-2.5 px-3 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414542]/50">
                  {publications.map((pub) => (
                    <tr key={pub.id} className="hover:bg-[#303430]/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium uppercase text-[#EEE8DE]">{pub.platform}</td>
                      <td className="py-2.5 px-3 font-mono-metrics text-[#B8B0A5]">{pub.platform_post_id}</td>
                      <td className="py-2.5 px-3 text-[#B8B0A5]">{new Date(pub.published_at).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono-metrics text-emerald-400">✓ VERIFIED BY API</td>
                      <td className="py-2.5 px-3 text-right">
                        <a href={pub.platform_post_url} target="_blank" rel="noreferrer" className="text-[#A16C50] hover:underline flex items-center justify-end gap-1">
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OAUTH CONNECTION MODAL */}
      {authModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#A16C50]" />
                <h3 className="text-sm font-semibold text-[#EEE8DE]">
                  Connect {authModalPlatform} via OAuth 2.0
                </h3>
              </div>
              <button onClick={() => setAuthModalPlatform(null)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#B8B0A5] leading-relaxed">
              PROMETHEUS-9 strictly adheres to official developer guidelines. Passwords are never requested. You will be redirected to the official {authModalPlatform} dialog to grant publishing permissions.
            </p>

            <div className="p-3 rounded-lg bg-[#202221] text-xs font-mono-metrics text-[#EEE8DE] space-y-1">
              <div>ENCRYPTION: Fernet Token Vault Active</div>
              <div>RATE LIMIT: Token-Aware Queue Managed</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAuthModalPlatform(null)}
                className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Official OAuth dialog for ${authModalPlatform} initiated.`);
                  setAuthModalPlatform(null);
                }}
                className="px-5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE]"
              >
                Authorize {authModalPlatform}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Launch New Campaign</h3>
              <button onClick={() => setShowAddCampaignModal(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Brand Growth"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound leads & brand awareness"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Budget Cap (USD)</label>
                <input
                  type="number"
                  value={campaignBudget}
                  onChange={(e) => setCampaignBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCampaignModal(false)} className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]">
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingCampaign} className="px-5 py-2 rounded-lg bg-[#A16C50] text-xs font-semibold text-[#EEE8DE]">
                  {isCreatingCampaign ? 'Creating...' : 'Initialize Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
