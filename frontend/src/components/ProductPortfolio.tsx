import React, { useState } from "react";
import { Product, ProductFeature } from "../types";
import { Boxes, Plus, ShieldCheck, AlertCircle, ExternalLink, Check } from "lucide-react";

interface ProductPortfolioProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (p: Product | null) => void;
  onRefresh: () => void;
}

export const ProductPortfolio: React.FC<ProductPortfolioProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<"list" | "register">("list");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    tagline: "",
    description: "",
    website_url: "",
    primary_objective: "awareness"
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = (await res.json()) as any;
        throw new Error(err.detail || "Failed to create product");
      }
      setMessage("Product successfully registered into portfolio.");
      setFormData({
        name: "",
        slug: "",
        category: "",
        tagline: "",
        description: "",
        website_url: "",
        primary_objective: "awareness"
      });
      onRefresh();
      setTimeout(() => setActiveTab("list"), 1200);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#EEE8DE] font-['Manrope']">Product Portfolio</h2>
          <p className="text-xs text-[#C9B49B] mt-1">
            Isolated multi-product marketing intelligence registry. Features and claims are strictly partitioned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "list"
                ? "bg-[#A16C50] text-[#EEE8DE]"
                : "bg-[#414542]/30 text-[#C9B49B] hover:bg-[#414542]/50"
            }`}
          >
            Portfolio Directory
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "register"
                ? "bg-[#A16C50] text-[#EEE8DE]"
                : "bg-[#414542]/30 text-[#C9B49B] hover:bg-[#414542]/50"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Register Product
          </button>
        </div>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`bg-[#202221] border rounded-lg p-5 transition-all ${
                    isSelected ? "border-[#A16C50] shadow-md shadow-[#A16C50]/20" : "border-[#414542]/70 hover:border-[#A16C50]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#414542]/40 text-[#C9B49B]">
                          {p.category}
                        </span>
                        <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#A16C50]/20 text-[#A16C50]">
                          Isolated Namespace
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#EEE8DE] mt-2 font-['Manrope']">{p.name}</h3>
                      <p className="text-xs text-[#C9B49B] mt-0.5 italic">{p.tagline}</p>
                    </div>

                    <button
                      onClick={() => onSelectProduct(isSelected ? null : p)}
                      className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                        isSelected
                          ? "bg-[#A16C50] text-[#EEE8DE]"
                          : "bg-[#414542]/30 text-[#C9B49B] hover:text-[#EEE8DE] hover:bg-[#414542]"
                      }`}
                    >
                      {isSelected ? "Active Focus" : "Select Focus"}
                    </button>
                  </div>

                  <p className="text-xs text-[#EEE8DE]/70 mt-3 leading-relaxed">{p.description}</p>

                  <div className="mt-4 pt-3 border-t border-[#414542]/40 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#414542]/20 p-2 rounded">
                      <div className="font-bold text-[#EEE8DE] font-mono-metrics">{p.features_count}</div>
                      <div className="text-[10px] text-[#C9B49B]/70">Verified Facts</div>
                    </div>
                    <div className="bg-[#414542]/20 p-2 rounded">
                      <div className="font-bold text-[#EEE8DE] font-mono-metrics">{p.sources_count}</div>
                      <div className="text-[10px] text-[#C9B49B]/70">Sources</div>
                    </div>
                    <div className="bg-[#414542]/20 p-2 rounded">
                      <div className="font-bold text-[#EEE8DE] font-mono-metrics">{p.campaigns_count}</div>
                      <div className="text-[10px] text-[#C9B49B]/70">Campaigns</div>
                    </div>
                  </div>

                  {p.website_url && (
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#C9B49B]">
                      <span>Website: {p.website_url}</span>
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Register Product Form */
        <div className="bg-[#202221] border border-[#414542]/70 rounded-lg p-6 max-w-2xl">
          <h3 className="text-base font-bold text-[#EEE8DE] mb-4 font-['Manrope']">Register New Operating Product</h3>
          {message && (
            <div className="mb-4 p-3 rounded bg-[#414542]/40 border border-[#A16C50]/50 text-xs text-[#EEE8DE]">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#C9B49B] mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nova-9"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    setFormData({ ...formData, name, slug });
                  }}
                  className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9B49B] mb-1">Slug (Namespace Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nova-9"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] font-mono-metrics focus:border-[#A16C50] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#C9B49B] mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developer Tools, Healthcare AI"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#C9B49B] mb-1">Primary Objective</label>
                <select
                  value={formData.primary_objective}
                  onChange={(e) => setFormData({ ...formData, primary_objective: e.target.value })}
                  className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                >
                  <option value="awareness">Brand Awareness</option>
                  <option value="qualified_leads">Qualified Enterprise Leads</option>
                  <option value="demos">Demonstration Requests</option>
                  <option value="registrations">User Registrations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9B49B] mb-1">Tagline</label>
              <input
                type="text"
                placeholder="High-level value proposition"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9B49B] mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C9B49B] mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Core product narrative and purpose..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#202221] border border-[#414542] rounded px-3 py-1.5 text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-1.5 text-xs text-[#C9B49B] hover:text-[#EEE8DE]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#A16C50] text-[#EEE8DE] rounded text-xs font-medium hover:bg-[#B87C5E] transition-all disabled:opacity-50"
              >
                {submitting ? "Registering..." : "Confirm Registration"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
