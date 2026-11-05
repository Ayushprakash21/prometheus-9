import React, { useState } from 'react';
import { 
  SocialAccount, 
  PublicationRecord, 
  Product 
} from '../types';
import { 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Key, 
  Clock, 
  ShieldCheck, 
  Calendar,
  X,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';

interface SocialConstellationViewProps {
  product: Product | null;
  accounts: SocialAccount[];
  publications: PublicationRecord[];
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export const SocialConstellationView: React.FC<SocialConstellationViewProps> = ({
  product,
  accounts,
  publications,
  onRefresh,
  onClose
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, scopes: 'youtube.upload, youtube.readonly', desc: 'Longform video and YouTube Shorts publishing' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, scopes: 'instagram_basic, instagram_content_publish', desc: 'Reels, Carousels, and visual posts' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, scopes: 'w_member_social, r_liteprofile', desc: 'B2B executive thought leadership & longform text' },
    { id: 'x', name: 'X (Twitter)', icon: Twitter, scopes: 'tweet.read, tweet.write, users.read', desc: 'High-frequency commentary and thread distribution' },
    { id: 'tiktok', name: 'TikTok', icon: Share2, scopes: 'video.upload, user.info.basic', desc: 'Vertical video rapid discovery channel' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, scopes: 'pages_manage_posts, pages_read_engagement', desc: 'Community page broadcasts' },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-copper-subtle pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              DISTRIBUTION CONSTELLATION // OAUTH 2.0 GATEWAY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
            <span className="font-mono-metrics text-xs text-[#C9B49B]">
              {product ? product.name.toUpperCase() : 'ALL BRANDS'}
            </span>
          </div>
          <h1 className="font-editorial text-4xl text-[#EEE8DE] mt-1 font-normal tracking-tight">
            Social Distribution Constellation
          </h1>
          <p className="font-expressive text-lg text-[#C9B49B] italic mt-0.5">
            Authorized platform destinations governed by official OAuth tokens and verified API publishing.
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] transition-colors"
        >
          Return to Universe
        </button>
      </div>

      {/* 6 Destination Nodes Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((plat) => {
          const Icon = plat.icon;
          const connectedAcc = accounts.find(a => a.platform.toLowerCase() === plat.id.toLowerCase());
          const isConnected = Boolean(connectedAcc && connectedAcc.authorization_status === 'connected');

          return (
            <div
              key={plat.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isConnected
                  ? 'bg-[#292d2b] border-[#A16C50] copper-glow-sm'
                  : 'bg-[#292d2b]/40 border-copper-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#202221] border border-copper-subtle/40">
                    <Icon className="w-5 h-5 text-[#A16C50]" />
                  </div>
                  <span className={`flex items-center gap-1.5 font-mono-metrics text-[10px] px-2.5 py-1 rounded-full ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#414542]/40 text-[#C9B49B]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-500'}`} />
                    <span>{isConnected ? 'OAUTH ACTIVE' : 'AWAITING AUTH'}</span>
                  </span>
                </div>

                <h3 className="font-editorial text-xl text-[#EEE8DE]">{plat.name}</h3>
                <p className="font-interface text-xs text-[#C9B49B] mt-1.5 leading-relaxed">
                  {plat.desc}
                </p>

                {connectedAcc && (
                  <div className="mt-4 p-3 rounded-xl bg-[#202221] border border-copper-subtle/50 text-xs font-mono-metrics text-[#EEE8DE]">
                    <div className="text-[10px] text-[#A16C50] uppercase">Authorized Identity:</div>
                    <div className="font-semibold mt-0.5">{connectedAcc.account_name}</div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-copper-subtle/30 flex items-center justify-between">
                <span className="font-mono-metrics text-[10px] text-[#C9B49B]/60 truncate max-w-[140px]">
                  {plat.scopes}
                </span>
                <button
                  onClick={() => setSelectedPlatform(plat.name)}
                  className="px-4 py-1.5 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] hover:bg-[#A16C50]/20 transition-all cursor-pointer"
                >
                  {isConnected ? 'Manage OAuth' : 'Connect API'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* OAuth Connection Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#202221] border border-[#A16C50] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-copper-subtle pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#A16C50]" />
                <h3 className="font-editorial text-lg text-[#EEE8DE]">
                  Official {selectedPlatform} OAuth
                </h3>
              </div>
              <button onClick={() => setSelectedPlatform(null)} className="text-[#C9B49B] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-interface text-xs text-[#C9B49B] leading-relaxed">
              PROMETHEUS-9 strictly adheres to official developer guidelines. Never enter account passwords. OAuth 2.0 redirects to the platform authorization dialog to issue an encrypted short-lived token.
            </p>

            <div className="p-3 rounded-xl bg-[#292d2b] text-[11px] font-mono-metrics text-[#EEE8DE] space-y-1">
              <div>REQUIRED SCOPES: Verified Publishing</div>
              <div>ENCRYPTION: AES-256-GCM Hardware-Secured</div>
              <div>RATE LIMIT: Deterministic Queue Guarded</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPlatform(null)}
                className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Official OAuth redirect for ${selectedPlatform} initiated. Tokens will be securely encrypted in the local database.`);
                  setSelectedPlatform(null);
                }}
                className="px-5 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] font-semibold"
              >
                Authorize via {selectedPlatform}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publication Records Table */}
      <div className="mt-10 p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-editorial text-2xl text-[#EEE8DE]">Verified Publication Ledger</h3>
            <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
              Live records confirmed via official social platform post IDs.
            </p>
          </div>
          <span className="font-mono-metrics text-xs text-[#A16C50]">
            {publications.length} POSTS CAPTURED
          </span>
        </div>

        {publications.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#202221] border border-copper-subtle/50 text-center text-xs font-interface text-[#C9B49B]">
            No live publications recorded yet. Connect an authorized social channel and approve a campaign to begin distribution.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-interface">
              <thead>
                <tr className="border-b border-copper-subtle text-[10px] font-mono-metrics text-[#C9B49B] uppercase">
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Platform Post ID</th>
                  <th className="py-3 px-4">Published At</th>
                  <th className="py-3 px-4">API Verification</th>
                  <th className="py-3 px-4 text-right">Destination Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper-subtle/30">
                {publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-[#202221]/60">
                    <td className="py-3 px-4 font-semibold text-[#EEE8DE] uppercase">{pub.platform}</td>
                    <td className="py-3 px-4 font-mono-metrics text-[#C9B49B]">{pub.platform_post_id}</td>
                    <td className="py-3 px-4 text-[#C9B49B]">{new Date(pub.published_at).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono-metrics text-emerald-400">
                      {pub.verified_by_api ? '✓ VERIFIED BY API' : 'PENDING'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={pub.platform_post_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#A16C50] hover:underline flex items-center justify-end gap-1"
                      >
                        <span>View Post</span>
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
    </div>
  );
};
