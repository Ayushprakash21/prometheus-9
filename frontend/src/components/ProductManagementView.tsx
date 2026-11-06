import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Product, 
  BrandProfile, 
  ProductFeature, 
  AudiencePersona, 
  ProductSource 
} from '../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Compass, 
  Save,
  Target,
  ExternalLink,
  X,
  AlertCircle,
  MoreVertical,
  Copy,
  Check,
  Filter,
  Globe,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  Info,
  Tag,
  ChevronRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct,
  duplicateProduct,
  updateProductStatus,
  updateBrandProfile, 
  createFeature, 
  updateFeature,
  deleteFeature,
  createAudience, 
  updateAudience,
  deleteAudience,
  createSource,
  updateSource,
  deleteSource
} from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface ProductManagementViewProps {
  products: Product[];
  selectedProduct: Product | null;
  features: ProductFeature[];
  brandProfile: BrandProfile | null;
  audiences: AudiencePersona[];
  sources: ProductSource[];
  onSelectProduct: (product: Product) => void;
  onRefresh: () => Promise<void>;
  initialSubTab?: 'products' | 'brand_profile' | 'audiences' | 'features' | 'sources' | 'strategy';
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  selectedProduct,
  features,
  brandProfile,
  audiences,
  sources,
  onSelectProduct,
  onRefresh,
  initialSubTab = 'products'
}) => {
  const { isDark } = useTheme();

  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<string>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'features'>('created_at');

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Row Action Menu State
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Feature Modals
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ProductFeature | null>(null);

  // Audience Modals
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [editingAudience, setEditingAudience] = useState<AudiencePersona | null>(null);

  // Source Modals
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState<ProductSource | null>(null);

  // Form State: Add Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Autonomous AI / SaaS');
  const [newProdTagline, setNewProdTagline] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdWebsite, setNewProdWebsite] = useState('');
  const [newProdLogoUrl, setNewProdLogoUrl] = useState('');
  const [newProdObjective, setNewProdObjective] = useState('Autonomous marketing and customer acquisition');
  const [newProdTargetMarket, setNewProdTargetMarket] = useState('');
  const [newProdTargetAudience, setNewProdTargetAudience] = useState('');
  const [newProdUsp, setNewProdUsp] = useState('');
  const [newProdKeywords, setNewProdKeywords] = useState('');
  const [newProdLaunchDate, setNewProdLaunchDate] = useState('');
  const [newProdStatus, setNewProdStatus] = useState('active');
  const [newProdFeatures, setNewProdFeatures] = useState<{ name: string; description: string; benefit_statement: string }[]>([]);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  // Form State: Edit Product
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdTagline, setEditProdTagline] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdWebsite, setEditProdWebsite] = useState('');
  const [editProdLogoUrl, setEditProdLogoUrl] = useState('');
  const [editProdObjective, setEditProdObjective] = useState('');
  const [editProdTargetMarket, setEditProdTargetMarket] = useState('');
  const [editProdTargetAudience, setEditProdTargetAudience] = useState('');
  const [editProdUsp, setEditProdUsp] = useState('');
  const [editProdKeywords, setEditProdKeywords] = useState('');
  const [editProdLaunchDate, setEditProdLaunchDate] = useState('');
  const [editProdStatus, setEditProdStatus] = useState('active');
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  // Form State: Brand Profile (17 fields)
  const [brandName, setBrandName] = useState(brandProfile?.brand_name || '');
  const [brandDesc, setBrandDesc] = useState(brandProfile?.description || '');
  const [brandIndustry, setBrandIndustry] = useState(brandProfile?.industry || '');
  const [brandWebsite, setBrandWebsite] = useState(brandProfile?.website_url || '');
  const [brandLogo, setBrandLogo] = useState(brandProfile?.logo_url || '');
  const [missionStatement, setMissionStatement] = useState(brandProfile?.mission_statement || '');
  const [visionStatement, setVisionStatement] = useState(brandProfile?.vision_statement || '');
  const [brandValues, setBrandValues] = useState(brandProfile?.values?.join(', ') || '');
  const [personalityTraits, setPersonalityTraits] = useState(brandProfile?.personality_traits?.join(', ') || '');
  const [toneOfVoice, setToneOfVoice] = useState(brandProfile?.tone_of_voice || 'Professional, authoritative, and direct');
  const [writingStyle, setWritingStyle] = useState(brandProfile?.writing_style || 'Clear, concise, and benefit-focused');
  const [preferredVocab, setPreferredVocab] = useState(brandProfile?.preferred_vocabulary?.join(', ') || '');
  const [wordsToAvoid, setWordsToAvoid] = useState(brandProfile?.words_to_avoid?.join(', ') || '');
  const [styleGuidelines, setStyleGuidelines] = useState(brandProfile?.style_guidelines || '');
  const [primaryColor, setPrimaryColor] = useState(brandProfile?.primary_color || '#292B29');
  const [secondaryColor, setSecondaryColor] = useState(brandProfile?.secondary_color || '#C9B49B');
  const [accentColor, setAccentColor] = useState(brandProfile?.accent_color || '#A16C50');
  const [targetMarketSummary, setTargetMarketSummary] = useState(brandProfile?.target_market_summary || '');
  const [bannedClaims, setBannedClaims] = useState(brandProfile?.do_not_mention_claims?.join('\n') || '');
  const [mandatoryDisclaimers, setMandatoryDisclaimers] = useState(brandProfile?.mandatory_disclaimers?.join('\n') || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync Brand Profile state when selected product / brandProfile changes
  useEffect(() => {
    if (brandProfile) {
      setBrandName(brandProfile.brand_name || selectedProduct?.name || '');
      setBrandDesc(brandProfile.description || selectedProduct?.description || '');
      setBrandIndustry(brandProfile.industry || selectedProduct?.category || '');
      setBrandWebsite(brandProfile.website_url || selectedProduct?.website_url || '');
      setBrandLogo(brandProfile.logo_url || selectedProduct?.logo_url || '');
      setMissionStatement(brandProfile.mission_statement || '');
      setVisionStatement(brandProfile.vision_statement || '');
      setBrandValues(brandProfile.values?.join(', ') || '');
      setPersonalityTraits(brandProfile.personality_traits?.join(', ') || '');
      setToneOfVoice(brandProfile.tone_of_voice || 'Professional, authoritative, and direct');
      setWritingStyle(brandProfile.writing_style || 'Clear, concise, and benefit-focused');
      setPreferredVocab(brandProfile.preferred_vocabulary?.join(', ') || '');
      setWordsToAvoid(brandProfile.words_to_avoid?.join(', ') || '');
      setStyleGuidelines(brandProfile.style_guidelines || '');
      setPrimaryColor(brandProfile.primary_color || '#292B29');
      setSecondaryColor(brandProfile.secondary_color || '#C9B49B');
      setAccentColor(brandProfile.accent_color || '#A16C50');
      setTargetMarketSummary(brandProfile.target_market_summary || selectedProduct?.target_market || '');
      setBannedClaims(brandProfile.do_not_mention_claims?.join('\n') || '');
      setMandatoryDisclaimers(brandProfile.mandatory_disclaimers?.join('\n') || '');
    } else if (selectedProduct) {
      setBrandName(selectedProduct.name);
      setBrandDesc(selectedProduct.description || '');
      setBrandIndustry(selectedProduct.category || '');
      setBrandWebsite(selectedProduct.website_url || '');
      setBrandLogo(selectedProduct.logo_url || '');
      setTargetMarketSummary(selectedProduct.target_market || '');
    }
  }, [brandProfile, selectedProduct]);

  // Form State: Feature Modal
  const [featName, setFeatName] = useState('');
  const [featCategory, setFeatCategory] = useState('Core Feature');
  const [featDesc, setFeatDesc] = useState('');
  const [featBenefit, setFeatBenefit] = useState('');
  const [featEvidence, setFeatEvidence] = useState('');
  const [featEvidenceUrl, setFeatEvidenceUrl] = useState('');
  const [featStatus, setFeatStatus] = useState('verified');
  const [featNotes, setFeatNotes] = useState('');
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);

  // Form State: Audience Modal
  const [audName, setAudName] = useState('');
  const [audDesc, setAudDesc] = useState('');
  const [audAgeRange, setAudAgeRange] = useState('');
  const [audLocation, setAudLocation] = useState('');
  const [audOccupation, setAudOccupation] = useState('');
  const [audIncome, setAudIncome] = useState('');
  const [audPainPoints, setAudPainPoints] = useState('');
  const [audNeeds, setAudNeeds] = useState('');
  const [audInterests, setAudInterests] = useState('');
  const [audPlatforms, setAudPlatforms] = useState('');
  const [audBuyingBehavior, setAudBuyingBehavior] = useState('');
  const [isSubmittingAudience, setIsSubmittingAudience] = useState(false);

  // Form State: Source Modal
  const [srcTitle, setSrcTitle] = useState('');
  const [srcType, setSrcType] = useState('documentation');
  const [srcUrl, setSrcUrl] = useState('');
  const [srcSnippet, setSrcSnippet] = useState('');
  const [srcIsPrimary, setSrcIsPrimary] = useState(false);
  const [srcIsVerified, setSrcIsVerified] = useState(true);
  const [isSubmittingSource, setIsSubmittingSource] = useState(false);

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setEditProdName(prod.name);
    setEditProdCategory(prod.category);
    setEditProdTagline(prod.tagline || '');
    setEditProdDescription(prod.description || '');
    setEditProdWebsite(prod.website_url || '');
    setEditProdLogoUrl(prod.logo_url || '');
    setEditProdObjective(prod.primary_objective || '');
    setEditProdTargetMarket(prod.target_market || '');
    setEditProdTargetAudience(prod.target_audience || '');
    setEditProdUsp(prod.usp || '');
    setEditProdKeywords(prod.keywords ? prod.keywords.join(', ') : '');
    setEditProdLaunchDate(prod.launch_date || '');
    setEditProdStatus(prod.status || (prod.is_active ? 'active' : 'inactive'));
    setShowEditProductModal(true);
    setOpenActionMenuId(null);
  };

  // Submit Edit Product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    setIsUpdatingProduct(true);
    try {
      const kw = editProdKeywords.split(',').map(s => s.trim()).filter(Boolean);
      await updateProduct(productToEdit.id, {
        name: editProdName,
        category: editProdCategory,
        tagline: editProdTagline || null,
        description: editProdDescription || null,
        website_url: editProdWebsite || null,
        logo_url: editProdLogoUrl || null,
        primary_objective: editProdObjective,
        target_market: editProdTargetMarket || null,
        target_audience: editProdTargetAudience || null,
        usp: editProdUsp || null,
        keywords: kw.length ? kw : null,
        launch_date: editProdLaunchDate || null,
        status: editProdStatus,
        is_active: editProdStatus === 'active'
      });
      setShowEditProductModal(false);
      showToast(`Product "${editProdName}" updated successfully.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async (prod: Product) => {
    try {
      setOpenActionMenuId(null);
      showToast(`Duplicating "${prod.name}"...`, 'info');
      const duplicated = await duplicateProduct(prod.id);
      showToast(`Created duplicate: "${duplicated.name}".`);
      await onRefresh();
      onSelectProduct(duplicated);
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate product', 'error');
    }
  };

  // Change Status
  const handleStatusChange = async (prod: Product, newStatus: string) => {
    try {
      setOpenActionMenuId(null);
      await updateProductStatus(prod.id, newStatus, newStatus === 'active');
      showToast(`Status of "${prod.name}" set to ${newStatus.toUpperCase()}.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id, true);
      showToast(`Product "${productToDelete.name}" archived successfully.`);
      setShowDeleteConfirmModal(false);
      setProductToDelete(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive product', 'error');
    }
  };

  // Create Product Submit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);
    if (!newProdName.trim()) {
      setProductFormError('Product Name is required.');
      return;
    }
    // Duplicate name warning
    const exists = products.some(p => p.name.trim().toLowerCase() === newProdName.trim().toLowerCase());
    if (exists) {
      setProductFormError(`A product named "${newProdName}" already exists. Please choose a unique name.`);
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const kw = newProdKeywords.split(',').map(s => s.trim()).filter(Boolean);
      const created = await createProduct({
        name: newProdName.trim(),
        slug: newProdSlug.trim() || undefined,
        category: newProdCategory,
        tagline: newProdTagline.trim() || undefined,
        description: newProdDescription.trim() || undefined,
        website_url: newProdWebsite.trim() || undefined,
        logo_url: newProdLogoUrl.trim() || undefined,
        primary_objective: newProdObjective.trim(),
        target_market: newProdTargetMarket.trim() || undefined,
        target_audience: newProdTargetAudience.trim() || undefined,
        usp: newProdUsp.trim() || undefined,
        keywords: kw.length ? kw : undefined,
        launch_date: newProdLaunchDate || undefined,
        status: newProdStatus,
        features: newProdFeatures.length > 0 ? newProdFeatures.map(f => ({
          name: f.name,
          description: f.description,
          benefit_statement: f.benefit_statement,
          is_verified: true
        })) : undefined
      });

      // Reset form
      setNewProdName('');
      setNewProdSlug('');
      setNewProdTagline('');
      setNewProdWebsite('');
      setNewProdLogoUrl('');
      setNewProdDescription('');
      setNewProdTargetMarket('');
      setNewProdTargetAudience('');
      setNewProdUsp('');
      setNewProdKeywords('');
      setNewProdLaunchDate('');
      setNewProdFeatures([]);
      setShowAddProductModal(false);

      showToast(`Product "${created.name}" registered successfully.`);
      await onRefresh();
      onSelectProduct(created);
    } catch (err: any) {
      setProductFormError(err.message || 'Failed to create product.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Save Brand Profile
  const handleSaveBrandProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSavingProfile(true);
    try {
      const vals = brandValues.split(',').map(s => s.trim()).filter(Boolean);
      const traits = personalityTraits.split(',').map(s => s.trim()).filter(Boolean);
      const vocab = preferredVocab.split(',').map(s => s.trim()).filter(Boolean);
      const avoid = wordsToAvoid.split(',').map(s => s.trim()).filter(Boolean);
      const claims = bannedClaims.split('\n').map(s => s.trim()).filter(Boolean);
      const disclaimers = mandatoryDisclaimers.split('\n').map(s => s.trim()).filter(Boolean);

      await updateBrandProfile(selectedProduct.id, {
        brand_name: brandName || selectedProduct.name,
        description: brandDesc || null,
        industry: brandIndustry || null,
        website_url: brandWebsite || null,
        logo_url: brandLogo || null,
        mission_statement: missionStatement || null,
        vision_statement: visionStatement || null,
        values: vals,
        personality_traits: traits,
        tone_of_voice: toneOfVoice,
        writing_style: writingStyle || null,
        preferred_vocabulary: vocab,
        words_to_avoid: avoid,
        style_guidelines: styleGuidelines || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        target_market_summary: targetMarketSummary || null,
        do_not_mention_claims: claims,
        mandatory_disclaimers: disclaimers
      });

      showToast(`Brand Profile for "${selectedProduct.name}" saved successfully.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save Brand Profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Feature Actions
  const handleOpenAddFeature = () => {
    setEditingFeature(null);
    setFeatName('');
    setFeatCategory('Core Capability');
    setFeatDesc('');
    setFeatBenefit('');
    setFeatEvidence('');
    setFeatEvidenceUrl('');
    setFeatStatus('verified');
    setFeatNotes('');
    setShowFeatureModal(true);
  };

  const handleOpenEditFeature = (feat: ProductFeature) => {
    setEditingFeature(feat);
    setFeatName(feat.name);
    setFeatCategory(feat.category || 'Core Capability');
    setFeatDesc(feat.description);
    setFeatBenefit(feat.benefit_statement || '');
    setFeatEvidence(feat.supporting_evidence || '');
    setFeatEvidenceUrl(feat.evidence_url || '');
    setFeatStatus(feat.verification_status || (feat.is_verified ? 'verified' : 'pending'));
    setFeatNotes(feat.notes || '');
    setShowFeatureModal(true);
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !featName.trim()) return;
    setIsSubmittingFeature(true);
    try {
      if (editingFeature) {
        await updateFeature(selectedProduct.id, editingFeature.id, {
          name: featName,
          category: featCategory,
          description: featDesc,
          benefit_statement: featBenefit || null,
          supporting_evidence: featEvidence || null,
          evidence_url: featEvidenceUrl || null,
          verification_status: featStatus,
          notes: featNotes || null,
          is_verified: featStatus === 'verified'
        });
        showToast(`Capability "${featName}" updated.`);
      } else {
        await createFeature(selectedProduct.id, {
          name: featName,
          category: featCategory,
          description: featDesc,
          benefit_statement: featBenefit || undefined,
          supporting_evidence: featEvidence || undefined,
          evidence_url: featEvidenceUrl || undefined,
          verification_status: featStatus,
          notes: featNotes || undefined,
          is_verified: featStatus === 'verified'
        });
        showToast(`Capability "${featName}" added.`);
      }
      setShowFeatureModal(false);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save feature', 'error');
    } finally {
      setIsSubmittingFeature(false);
    }
  };

  const handleDeleteFeature = async (featId: string, featName: string) => {
    if (!selectedProduct) return;
    if (!confirm(`Are you sure you want to delete capability "${featName}"?`)) return;
    try {
      await deleteFeature(selectedProduct.id, featId);
      showToast(`Capability "${featName}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete feature', 'error');
    }
  };

  // Audience Actions
  const handleOpenAddAudience = () => {
    setEditingAudience(null);
    setAudName('');
    setAudDesc('');
    setAudAgeRange('');
    setAudLocation('');
    setAudOccupation('');
    setAudIncome('');
    setAudPainPoints('');
    setAudNeeds('');
    setAudInterests('');
    setAudPlatforms('');
    setAudBuyingBehavior('');
    setShowAudienceModal(true);
  };

  const handleOpenEditAudience = (aud: AudiencePersona) => {
    setEditingAudience(aud);
    setAudName(aud.name);
    setAudDesc(aud.description);
    setAudAgeRange(aud.age_range || '');
    setAudLocation(aud.location || '');
    setAudOccupation(aud.occupation || '');
    setAudIncome(aud.income_level || '');
    setAudPainPoints(aud.pain_points ? aud.pain_points.join('\n') : '');
    setAudNeeds(aud.needs ? aud.needs.join('\n') : '');
    setAudInterests(aud.interests ? aud.interests.join(', ') : '');
    setAudPlatforms(aud.preferred_platforms ? aud.preferred_platforms.join(', ') : (aud.channels ? aud.channels.join(', ') : ''));
    setAudBuyingBehavior(aud.buying_behavior || '');
    setShowAudienceModal(true);
  };

  const handleSaveAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !audName.trim()) return;
    setIsSubmittingAudience(true);
    try {
      const pains = audPainPoints.split('\n').map(s => s.trim()).filter(Boolean);
      const nds = audNeeds.split('\n').map(s => s.trim()).filter(Boolean);
      const ints = audInterests.split(',').map(s => s.trim()).filter(Boolean);
      const plats = audPlatforms.split(',').map(s => s.trim()).filter(Boolean);

      if (editingAudience) {
        await updateAudience(selectedProduct.id, editingAudience.id, {
          name: audName,
          description: audDesc,
          age_range: audAgeRange || null,
          location: audLocation || null,
          occupation: audOccupation || null,
          income_level: audIncome || null,
          pain_points: pains,
          needs: nds,
          interests: ints,
          preferred_platforms: plats,
          buying_behavior: audBuyingBehavior || null
        });
        showToast(`Audience Persona "${audName}" updated.`);
      } else {
        await createAudience(selectedProduct.id, {
          name: audName,
          description: audDesc,
          age_range: audAgeRange || undefined,
          location: audLocation || undefined,
          occupation: audOccupation || undefined,
          income_level: audIncome || undefined,
          pain_points: pains,
          needs: nds,
          interests: ints,
          preferred_platforms: plats,
          buying_behavior: audBuyingBehavior || undefined
        });
        showToast(`Audience Persona "${audName}" created.`);
      }
      setShowAudienceModal(false);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save audience', 'error');
    } finally {
      setIsSubmittingAudience(false);
    }
  };

  const handleDeleteAudience = async (audId: string, audName: string) => {
    if (!selectedProduct) return;
    if (!confirm(`Are you sure you want to delete audience persona "${audName}"?`)) return;
    try {
      await deleteAudience(selectedProduct.id, audId);
      showToast(`Audience Persona "${audName}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete audience', 'error');
    }
  };

  // Source Actions
  const handleOpenAddSource = () => {
    setEditingSource(null);
    setSrcTitle('');
    setSrcType('documentation');
    setSrcUrl('');
    setSrcSnippet('');
    setSrcIsPrimary(false);
    setSrcIsVerified(true);
    setShowSourceModal(true);
  };

  const handleOpenEditSource = (src: ProductSource) => {
    setEditingSource(src);
    setSrcTitle(src.title);
    setSrcType(src.source_type);
    setSrcUrl(src.source_url || '');
    setSrcSnippet(src.content_snippet || '');
    setSrcIsPrimary(src.is_primary);
    setSrcIsVerified(src.is_verified ?? true);
    setShowSourceModal(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !srcTitle.trim()) return;
    setIsSubmittingSource(true);
    try {
      if (editingSource) {
        await updateSource(selectedProduct.id, editingSource.id, {
          title: srcTitle,
          source_type: srcType,
          source_url: srcUrl || null,
          content_snippet: srcSnippet || null,
          is_primary: srcIsPrimary,
          is_verified: srcIsVerified
        });
        showToast(`Source "${srcTitle}" updated.`);
      } else {
        await createSource(selectedProduct.id, {
          title: srcTitle,
          source_type: srcType,
          source_url: srcUrl || undefined,
          content_snippet: srcSnippet || undefined,
          is_primary: srcIsPrimary,
          is_verified: srcIsVerified
        });
        showToast(`Source "${srcTitle}" registered.`);
      }
      setShowSourceModal(false);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save source', 'error');
    } finally {
      setIsSubmittingSource(false);
    }
  };

  const handleDeleteSource = async (srcId: string, srcTitle: string) => {
    if (!selectedProduct) return;
    if (!confirm(`Are you sure you want to remove source "${srcTitle}"?`)) return;
    try {
      await deleteSource(selectedProduct.id, srcId);
      showToast(`Source "${srcTitle}" removed.`);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete source', 'error');
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.target_market && p.target_market.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
      
      const pStatus = p.status || (p.is_active ? 'active' : 'inactive');
      const matchesStatus = statusFilter === 'all' || pStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'features') return (b.features_count || 0) - (a.features_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return Array.from(set);
  }, [products]);

  // Dynamic Theme Colors
  // Light Palette: #FFFFFF, #F8F8F6, #F1F1EE, #E3E3DE, #292B29, #686B67, #898B85, #C9B49B, #E9DFD2, #F5F0E9
  // Dark Palette: #111211, #161816, #1C1E1C, #2D332D, #F5F2EB, #C5BFB5, #8E8A82, #C9B49B, #302B24, #1F1E1B
  const themeClasses = useMemo(() => {
    if (isDark) {
      return {
        viewBg: 'bg-[#111211] text-[#F5F2EB]',
        cardBg: 'bg-[#161816] border-[#2E332E]',
        cardAlt: 'bg-[#1B1E1B] border-[#2E332E]',
        headerBg: 'bg-[#181A18] border-b border-[#2E332E]',
        inputBg: 'bg-[#121312] border-[#363B36] text-[#F5F2EB] focus:border-[#C9B49B]',
        tableRowHover: 'hover:bg-[#1E221E]',
        tableHeadBg: 'bg-[#141614] border-b border-[#2E332E] text-[#8E8A82]',
        pillActive: 'bg-[#C9B49B] text-[#111211] font-semibold',
        pillInactive: 'bg-[#1C1E1C] border-[#2E332E] text-[#C5BFB5] hover:text-[#F5F2EB]',
        textPrimary: 'text-[#F5F2EB]',
        textSecondary: 'text-[#C5BFB5]',
        textMuted: 'text-[#8E8A82]',
        accentBeige: 'text-[#C9B49B]',
        surfaceBeige: 'bg-[#2A261F] border-[#423A2E] text-[#E9DFD2]',
        borderColor: 'border-[#2E332E]',
        primaryBtn: 'bg-[#C9B49B] hover:bg-[#D5C2AB] text-[#111211] font-semibold transition-colors',
        secondaryBtn: 'bg-[#1C1E1C] border border-[#2E332E] hover:border-[#C9B49B] text-[#F5F2EB] transition-colors',
      };
    }
    return {
      viewBg: 'bg-[#F7F7F5] text-[#262724]',
      cardBg: 'bg-[#FFFFFF] border-[#E2E1DC]',
      cardAlt: 'bg-[#F8F8F6] border-[#E2E1DC]',
      headerBg: 'bg-[#FFFFFF] border-b border-[#E2E1DC]',
      inputBg: 'bg-[#FFFFFF] border-[#D8D7D1] text-[#262724] focus:border-[#B99A78]',
      tableRowHover: 'hover:bg-[#F8F8F6]',
      tableHeadBg: 'bg-[#F3F1ED] border-b border-[#E2E1DC] text-[#555750]',
      pillActive: 'bg-[#292B29] text-[#FFFFFF] font-semibold',
      pillInactive: 'bg-[#FFFFFF] border-[#E2E1DC] text-[#555750] hover:text-[#262724] hover:bg-[#F8F8F6]',
      textPrimary: 'text-[#262724]',
      textSecondary: 'text-[#555750]',
      textMuted: 'text-[#85867F]',
      accentBeige: 'text-[#806347]',
      surfaceBeige: 'bg-[#F1EAE0] border-[#E2D5C5] text-[#514334]',
      borderColor: 'border-[#E2E1DC]',
      primaryBtn: 'bg-[#292B29] hover:bg-[#414542] text-[#FFFFFF] font-semibold transition-colors',
      secondaryBtn: 'bg-[#F1EAE0] border border-[#E2D5C5] hover:bg-[#E9DFD2] text-[#514334] transition-colors',
    };
  }, [isDark]);

  return (
    <div className={`min-h-full ${themeClasses.viewBg} font-sans`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
          toastMessage.type === 'error' 
            ? 'bg-rose-900 border-rose-700 text-rose-100' 
            : toastMessage.type === 'info'
            ? 'bg-amber-900 border-amber-700 text-amber-100'
            : isDark 
            ? 'bg-[#1C1E1C] border-[#C9B49B] text-[#F5F2EB]' 
            : 'bg-[#FFFFFF] border-[#C9B49B] text-[#292B29]'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-current opacity-60 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Module Header Bar */}
      <div className={`px-6 py-5 ${themeClasses.headerBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono-metrics uppercase tracking-wider ${themeClasses.accentBeige} font-semibold`}>
                Enterprise Foundation
              </span>
              <span className={`text-xs ${themeClasses.textMuted}`}>•</span>
              <span className={`text-xs ${themeClasses.textMuted}`}>Single Source of Truth</span>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight mt-1 ${themeClasses.textPrimary}`}>
              Business & Product Registry
            </h1>
            <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
              Manage your product portfolio, brand profiles, audience personas, and deterministic ground-truth capabilities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddProductModal(true)}
              className={`px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Subtab Navigation Pills */}
        <div className="flex items-center gap-2 mt-6 max-w-7xl mx-auto overflow-x-auto pb-1">
          {[
            { id: 'products', label: 'Products & Services', count: products.length, icon: Layers },
            { id: 'brand_profile', label: 'Brand Profile & Voice', icon: Sparkles },
            { id: 'audiences', label: 'Audience Personas', count: audiences.length, icon: Users },
            { id: 'features', label: 'Verified Capabilities', count: features.length, icon: ShieldCheck },
            { id: 'sources', label: 'Sources of Truth', count: sources.length, icon: BookOpen }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer border transition-all whitespace-nowrap ${
                  isActive ? themeClasses.pillActive : themeClasses.pillInactive
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-metrics ${
                    isActive 
                      ? (isDark ? 'bg-[#111211] text-[#C9B49B]' : 'bg-[#FFFFFF] text-[#292B29]') 
                      : (isDark ? 'bg-[#2E332E] text-[#8E8A82]' : 'bg-[#E3E3DE] text-[#686B67]')
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Selected Product Context Banner (Shown on subtabs other than Products) */}
        {activeTab !== 'products' && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${themeClasses.cardBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${themeClasses.surfaceBeige}`}>
                {selectedProduct ? selectedProduct.name.substring(0, 2).toUpperCase() : 'ALL'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono-metrics uppercase tracking-wider ${themeClasses.textMuted}`}>
                    Active Product Context
                  </span>
                  {selectedProduct?.status && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      selectedProduct.status === 'active' 
                        ? 'bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-400/30'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  )}
                </div>
                <div className={`text-base font-semibold ${themeClasses.textPrimary}`}>
                  {selectedProduct ? selectedProduct.name : 'No Product Selected'}
                </div>
                {selectedProduct?.tagline && (
                  <div className={`text-xs ${themeClasses.textSecondary}`}>
                    {selectedProduct.tagline}
                  </div>
                )}
              </div>
            </div>

            {/* Switch Product dropdown */}
            <div className="flex items-center gap-2">
              <label className={`text-xs ${themeClasses.textMuted}`}>Switch Product:</label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) onSelectProduct(p);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${themeClasses.inputBg}`}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: PRODUCTS & SERVICES TABLE WITH ROW ACTIONS        */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search, Filters, and Sorting Controls */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${themeClasses.cardBg}`}>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${themeClasses.textMuted}`} />
                  <input
                    type="text"
                    placeholder="Search by product name, category, market, or tagline..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-colors ${themeClasses.inputBg}`}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${themeClasses.textMuted} hover:${themeClasses.textPrimary}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${themeClasses.inputBg}`}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${themeClasses.inputBg}`}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className={`text-xs ${themeClasses.textMuted}`}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${themeClasses.inputBg}`}
                >
                  <option value="created_at">Recently Added</option>
                  <option value="name">Alphabetical (A-Z)</option>
                  <option value="features">Most Capabilities</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className={`rounded-xl border overflow-hidden shadow-sm ${themeClasses.cardBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={themeClasses.tableHeadBg}>
                      <th className="py-3 px-4 font-semibold">Product & Tagline</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Target Market</th>
                      <th className="py-3 px-4 font-semibold text-center">Capabilities</th>
                      <th className="py-3 px-4 font-semibold text-center">Sources</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.borderColor}`}>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <Layers className={`w-8 h-8 mx-auto mb-2 opacity-30 ${themeClasses.textMuted}`} />
                          <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>No registered products found</div>
                          <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                            {searchQuery ? 'Try clearing your search query or filters.' : 'Click "Add Product" above to register your first business.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProduct?.id === p.id;
                        const pStatus = p.status || (p.is_active ? 'active' : 'inactive');

                        return (
                          <tr 
                            key={p.id}
                            className={`transition-colors ${themeClasses.tableRowHover} ${
                              isSelected ? (isDark ? 'bg-[#1C1E1C]/80 font-medium' : 'bg-[#F5F0E9]/60 font-medium') : ''
                            }`}
                          >
                            {/* Product Name & Tagline */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${themeClasses.surfaceBeige}`}>
                                  {p.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span 
                                      onClick={() => onSelectProduct(p)}
                                      className={`font-semibold cursor-pointer hover:underline truncate ${themeClasses.textPrimary}`}
                                    >
                                      {p.name}
                                    </span>
                                    {isSelected && (
                                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#C9B49B]/20 text-[#C9B49B] border border-[#C9B49B]/40">
                                        Selected
                                      </span>
                                    )}
                                  </div>
                                  {p.tagline && (
                                    <div className={`text-[11px] truncate max-w-xs ${themeClasses.textSecondary}`}>
                                      {p.tagline}
                                    </div>
                                  )}
                                  {p.website_url && (
                                    <a 
                                      href={p.website_url.startsWith('http') ? p.website_url : `https://${p.website_url}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1 text-[10px] mt-0.5 hover:underline ${themeClasses.accentBeige}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Globe className="w-2.5 h-2.5" />
                                      <span className="truncate max-w-[180px]">{p.website_url}</span>
                                      <ExternalLink className="w-2 h-2 opacity-60" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${
                                isDark ? 'bg-[#1C1E1C] border-[#2E332E] text-[#C5BFB5]' : 'bg-[#F1F1EE] border-[#E3E3DE] text-[#686B67]'
                              }`}>
                                {p.category}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${
                                pStatus === 'active' 
                                  ? 'bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                  : pStatus === 'draft'
                                  ? 'bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-400/30'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  pStatus === 'active' ? 'bg-emerald-500' : pStatus === 'draft' ? 'bg-amber-500' : 'bg-zinc-400'
                                }`} />
                                {pStatus}
                              </span>
                            </td>

                            {/* Target Market */}
                            <td className="py-3.5 px-4">
                              <span className={`text-xs ${themeClasses.textSecondary}`}>
                                {p.target_market || '—'}
                              </span>
                            </td>

                            {/* Capabilities Count */}
                            <td className="py-3.5 px-4 text-center font-mono-metrics">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                isDark ? 'bg-[#1C1E1C] text-[#C5BFB5]' : 'bg-[#F1F1EE] text-[#292B29]'
                              }`}>
                                {p.features_count || 0}
                              </span>
                            </td>

                            {/* Sources Count */}
                            <td className="py-3.5 px-4 text-center font-mono-metrics">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                isDark ? 'bg-[#1C1E1C] text-[#C5BFB5]' : 'bg-[#F1F1EE] text-[#292B29]'
                              }`}>
                                {p.sources_count || 0}
                              </span>
                            </td>

                            {/* Row Actions Dropdown */}
                            <td className="py-3.5 px-4 text-right relative">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    onSelectProduct(p);
                                    setActiveTab('brand_profile');
                                  }}
                                  className={`px-2 py-1 rounded text-[11px] font-medium border ${themeClasses.secondaryBtn}`}
                                  title="View details & configure brand"
                                >
                                  Manage
                                </button>

                                <div className="relative">
                                  <button
                                    onClick={() => setOpenActionMenuId(openActionMenuId === p.id ? null : p.id)}
                                    className={`p-1 rounded hover:${themeClasses.inputBg} ${themeClasses.textSecondary}`}
                                    aria-label="Actions menu"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openActionMenuId === p.id && (
                                    <div 
                                      ref={actionMenuRef}
                                      className={`absolute right-0 top-full mt-1 w-48 rounded-xl shadow-xl border py-1.5 z-50 text-left ${
                                        isDark ? 'bg-[#1A1C1A] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
                                      }`}
                                    >
                                      <button
                                        onClick={() => {
                                          onSelectProduct(p);
                                          setOpenActionMenuId(null);
                                        }}
                                        className={`w-full px-3 py-1.5 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} ${themeClasses.textPrimary}`}
                                      >
                                        <Check className="w-3.5 h-3.5 text-[#C9B49B]" />
                                        <span>Select Active</span>
                                      </button>

                                      <button
                                        onClick={() => handleOpenEditProduct(p)}
                                        className={`w-full px-3 py-1.5 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} ${themeClasses.textPrimary}`}
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-[#C9B49B]" />
                                        <span>Edit Product</span>
                                      </button>

                                      <button
                                        onClick={() => handleDuplicateProduct(p)}
                                        className={`w-full px-3 py-1.5 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} ${themeClasses.textPrimary}`}
                                      >
                                        <Copy className="w-3.5 h-3.5 text-[#C9B49B]" />
                                        <span>Duplicate Product</span>
                                      </button>

                                      <div className={`border-t my-1 ${themeClasses.borderColor}`} />

                                      <div className={`px-3 py-1 text-[10px] font-mono-metrics uppercase tracking-wider ${themeClasses.textMuted}`}>
                                        Set Status
                                      </div>

                                      <button
                                        onClick={() => handleStatusChange(p, 'active')}
                                        className={`w-full px-3 py-1 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} text-emerald-600 dark:text-emerald-400`}
                                      >
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>Mark Active</span>
                                      </button>

                                      <button
                                        onClick={() => handleStatusChange(p, 'inactive')}
                                        className={`w-full px-3 py-1 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} ${themeClasses.textSecondary}`}
                                      >
                                        <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                        <span>Mark Inactive</span>
                                      </button>

                                      <button
                                        onClick={() => handleStatusChange(p, 'draft')}
                                        className={`w-full px-3 py-1 text-xs flex items-center gap-2 hover:${themeClasses.inputBg} text-amber-600 dark:text-amber-400`}
                                      >
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span>Mark Draft</span>
                                      </button>

                                      <div className={`border-t my-1 ${themeClasses.borderColor}`} />

                                      <button
                                        onClick={() => {
                                          setProductToDelete(p);
                                          setShowDeleteConfirmModal(true);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Archive / Delete</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BRAND PROFILE & VOICE (17 FIELDS)                 */}
        {/* ======================================================== */}
        {activeTab === 'brand_profile' && selectedProduct && (
          <form onSubmit={handleSaveBrandProfile} className="space-y-6">
            <div className={`p-6 rounded-xl border space-y-6 ${themeClasses.cardBg}`}>
              <div className="flex items-center justify-between border-b pb-4 border-inherit">
                <div>
                  <h2 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                    Brand Identity & Voice Architecture
                  </h2>
                  <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                    Configure the deterministic voice profile, creative tone, and compliance constraints for {selectedProduct.name}.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Brand Profile'}</span>
                </button>
              </div>

              {/* Grid Section 1: Core Brand Identity */}
              <div>
                <h3 className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold mb-3 ${themeClasses.accentBeige}`}>
                  1. Brand Identity & Positioning
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Industry / Sector
                    </label>
                    <input
                      type="text"
                      value={brandIndustry}
                      onChange={(e) => setBrandIndustry(e.target.value)}
                      placeholder="e.g. Artificial Intelligence / B2B SaaS"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Official Website URL
                    </label>
                    <input
                      type="url"
                      value={brandWebsite}
                      onChange={(e) => setBrandWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Brand Logo URL
                    </label>
                    <input
                      type="url"
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      placeholder="https://example.com/logo.svg"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Target Market Summary
                    </label>
                    <input
                      type="text"
                      value={targetMarketSummary}
                      onChange={(e) => setTargetMarketSummary(e.target.value)}
                      placeholder="e.g. Mid-market marketing agencies"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Brand Bio / Description
                    </label>
                    <textarea
                      rows={2}
                      value={brandDesc}
                      onChange={(e) => setBrandDesc(e.target.value)}
                      placeholder="A comprehensive overview of what the brand does and who it serves."
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Grid Section 2: Mission, Vision & Core Values */}
              <div className="border-t pt-5 border-inherit">
                <h3 className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold mb-3 ${themeClasses.accentBeige}`}>
                  2. Mission, Vision & Core Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Mission Statement
                    </label>
                    <textarea
                      rows={2}
                      value={missionStatement}
                      onChange={(e) => setMissionStatement(e.target.value)}
                      placeholder="What the company exists to achieve today."
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Vision Statement
                    </label>
                    <textarea
                      rows={2}
                      value={visionStatement}
                      onChange={(e) => setVisionStatement(e.target.value)}
                      placeholder="The long-term future the company is creating."
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Core Values (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={brandValues}
                      onChange={(e) => setBrandValues(e.target.value)}
                      placeholder="Autonomy, Deterministic Verification, Precision, Luxury Craftsmanship"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Personality Traits (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={personalityTraits}
                      onChange={(e) => setPersonalityTraits(e.target.value)}
                      placeholder="Confident, Analytical, Restrained, Visionary, Dependable"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Grid Section 3: Tone of Voice & Editorial Style */}
              <div className="border-t pt-5 border-inherit">
                <h3 className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold mb-3 ${themeClasses.accentBeige}`}>
                  3. Tone of Voice & Writing Style
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Tone of Voice *
                    </label>
                    <select
                      value={toneOfVoice}
                      onChange={(e) => setToneOfVoice(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                    >
                      <option value="Professional, authoritative, and direct">Professional, authoritative, and direct</option>
                      <option value="Luxury editorial, cinematic, and refined">Luxury editorial, cinematic, and refined</option>
                      <option value="Energetic, growth-focused, and innovative">Energetic, growth-focused, and innovative</option>
                      <option value="Approachable, educational, and clear">Approachable, educational, and clear</option>
                      <option value="Provocative, contrarian, and bold">Provocative, contrarian, and bold</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Writing Style Guidelines
                    </label>
                    <input
                      type="text"
                      value={writingStyle}
                      onChange={(e) => setWritingStyle(e.target.value)}
                      placeholder="Concise sentences, strong verbs, zero buzzwords, active voice"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Preferred Vocabulary (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={preferredVocab}
                      onChange={(e) => setPreferredVocab(e.target.value)}
                      placeholder="Autonomous, deterministic, high-fidelity, verified, systematic"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Words to Avoid (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={wordsToAvoid}
                      onChange={(e) => setWordsToAvoid(e.target.value)}
                      placeholder="Synergy, revolutionize, game-changer, unlock potential, best-in-class"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Style Guidelines & Formatting Rules
                    </label>
                    <textarea
                      rows={2}
                      value={styleGuidelines}
                      onChange={(e) => setStyleGuidelines(e.target.value)}
                      placeholder="Always lead with quantifiable metrics. Use bullet points for feature lists. Capitalize product names."
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Grid Section 4: Brand Palette & Typography */}
              <div className="border-t pt-5 border-inherit">
                <h3 className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold mb-3 ${themeClasses.accentBeige}`}>
                  4. Visual Aesthetics & Brand Palette
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono-metrics outline-none border ${themeClasses.inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono-metrics outline-none border ${themeClasses.inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono-metrics outline-none border ${themeClasses.inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Section 5: Deterministic Claims Guard & Compliance */}
              <div className="border-t pt-5 border-inherit">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold ${themeClasses.accentBeige}`}>
                    5. Deterministic Compliance Guardrails
                  </h3>
                </div>
                <p className={`text-xs mb-3 ${themeClasses.textSecondary}`}>
                  Zero-hallucination safeguard: Agents will strictly reject or rewrite any copy that includes banned claims or omits mandatory disclaimers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 text-rose-600 dark:text-rose-400`}>
                      Do Not Mention Claims (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={bannedClaims}
                      onChange={(e) => setBannedClaims(e.target.value)}
                      placeholder="e.g. Guaranteed 10x ROI&#10;Zero effort required&#10;Replaces human doctors"
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border font-mono-metrics ${themeClasses.inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium mb-1 text-amber-600 dark:text-amber-400`}>
                      Mandatory Disclaimers (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={mandatoryDisclaimers}
                      onChange={(e) => setMandatoryDisclaimers(e.target.value)}
                      placeholder="e.g. Results may vary depending on implementation.&#10;Subject to terms of service."
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border font-mono-metrics ${themeClasses.inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Save Action */}
              <div className="border-t pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`px-6 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Brand Profile'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AUDIENCE PERSONAS                                 */}
        {/* ======================================================== */}
        {activeTab === 'audiences' && selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Target Audience Personas
                </h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                  Buyer personas, psychological pain points, and channel preferences for {selectedProduct.name}.
                </p>
              </div>
              <button
                onClick={handleOpenAddAudience}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Persona</span>
              </button>
            </div>

            {audiences.length === 0 ? (
              <div className={`p-12 text-center rounded-xl border ${themeClasses.cardBg}`}>
                <Users className={`w-8 h-8 mx-auto mb-2 opacity-30 ${themeClasses.textMuted}`} />
                <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>No audience personas defined</div>
                <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                  Create targeted buyer personas so agents can tailor content, tone, and hooks precisely.
                </div>
                <button
                  onClick={handleOpenAddAudience}
                  className={`mt-4 px-4 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 ${themeClasses.primaryBtn}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Persona</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audiences.map((aud) => (
                  <div key={aud.id} className={`p-5 rounded-xl border space-y-3 ${themeClasses.cardBg}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>{aud.name}</h3>
                          {aud.age_range && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono-metrics ${
                              isDark ? 'bg-[#1C1E1C] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F1F1EE] border-[#E3E3DE] text-[#686B67]'
                            }`}>
                              {aud.age_range}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${themeClasses.textSecondary}`}>{aud.description}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditAudience(aud)}
                          className={`p-1.5 rounded hover:${themeClasses.inputBg} ${themeClasses.textSecondary}`}
                          title="Edit Persona"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAudience(aud.id, aud.name)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                          title="Delete Persona"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {aud.occupation && (
                        <span className={`px-2 py-0.5 rounded ${themeClasses.cardAlt} ${themeClasses.textSecondary}`}>
                          Role: {aud.occupation}
                        </span>
                      )}
                      {aud.location && (
                        <span className={`px-2 py-0.5 rounded ${themeClasses.cardAlt} ${themeClasses.textSecondary}`}>
                          Location: {aud.location}
                        </span>
                      )}
                      {aud.income_level && (
                        <span className={`px-2 py-0.5 rounded ${themeClasses.cardAlt} ${themeClasses.textSecondary}`}>
                          Income: {aud.income_level}
                        </span>
                      )}
                    </div>

                    {/* Pain points */}
                    {aud.pain_points && aud.pain_points.length > 0 && (
                      <div>
                        <div className={`text-[10px] font-mono-metrics uppercase tracking-wider font-semibold mb-1 text-rose-600 dark:text-rose-400`}>
                          Core Pain Points:
                        </div>
                        <ul className={`list-disc list-inside text-xs space-y-0.5 ${themeClasses.textSecondary}`}>
                          {aud.pain_points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Needs & Aspirations */}
                    {aud.needs && aud.needs.length > 0 && (
                      <div>
                        <div className={`text-[10px] font-mono-metrics uppercase tracking-wider font-semibold mb-1 text-emerald-600 dark:text-emerald-400`}>
                          Primary Needs:
                        </div>
                        <ul className={`list-disc list-inside text-xs space-y-0.5 ${themeClasses.textSecondary}`}>
                          {aud.needs.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Platforms */}
                    {(aud.preferred_platforms || aud.channels) && (
                      <div className="pt-1">
                        <div className={`text-[10px] font-mono-metrics uppercase tracking-wider font-semibold mb-1 ${themeClasses.textMuted}`}>
                          Preferred Channels:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(aud.preferred_platforms || aud.channels || []).map((plat, i) => (
                            <span key={i} className={`text-[10px] px-2 py-0.5 rounded border ${
                              isDark ? 'bg-[#121312] border-[#2E332E] text-[#C9B49B]' : 'bg-[#FFFFFF] border-[#E3E3DE] text-[#292B29]'
                            }`}>
                              {plat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VERIFIED CAPABILITIES                             */}
        {/* ======================================================== */}
        {activeTab === 'features' && selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Deterministic Capabilities & Ground Truth Claims
                </h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                  Proven product capabilities with supporting evidence. Agents use these to generate factual marketing copy without hallucination.
                </p>
              </div>
              <button
                onClick={handleOpenAddFeature}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Capability</span>
              </button>
            </div>

            {features.length === 0 ? (
              <div className={`p-12 text-center rounded-xl border ${themeClasses.cardBg}`}>
                <ShieldCheck className={`w-8 h-8 mx-auto mb-2 opacity-30 ${themeClasses.textMuted}`} />
                <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>No verified capabilities recorded</div>
                <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                  Register the validated technical capabilities and features that marketing agents can cite with full confidence.
                </div>
                <button
                  onClick={handleOpenAddFeature}
                  className={`mt-4 px-4 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 ${themeClasses.primaryBtn}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Capability</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feat) => {
                  const vStatus = feat.verification_status || (feat.is_verified ? 'verified' : 'pending');

                  return (
                    <div key={feat.id} className={`p-5 rounded-xl border space-y-3 ${themeClasses.cardBg}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>{feat.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${
                              vStatus === 'verified' 
                                ? 'bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                : vStatus === 'rejected'
                                ? 'bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : 'bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}>
                              {vStatus === 'verified' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {vStatus === 'rejected' && <AlertCircle className="w-2.5 h-2.5" />}
                              {vStatus === 'pending' && <Clock className="w-2.5 h-2.5" />}
                              {vStatus}
                            </span>
                          </div>
                          {feat.category && (
                            <span className={`text-[10px] font-mono-metrics uppercase tracking-wider ${themeClasses.accentBeige}`}>
                              {feat.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditFeature(feat)}
                            className={`p-1.5 rounded hover:${themeClasses.inputBg} ${themeClasses.textSecondary}`}
                            title="Edit Capability"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feat.id, feat.name)}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                            title="Delete Capability"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs ${themeClasses.textSecondary}`}>{feat.description}</p>

                      {feat.benefit_statement && (
                        <div className={`p-2.5 rounded-lg border text-xs ${themeClasses.surfaceBeige}`}>
                          <span className="font-semibold text-xs block mb-0.5">Value Proposition / Benefit:</span>
                          <span className={themeClasses.textSecondary}>{feat.benefit_statement}</span>
                        </div>
                      )}

                      {feat.supporting_evidence && (
                        <div className="text-xs">
                          <span className={`font-mono-metrics text-[10px] uppercase tracking-wider font-semibold block ${themeClasses.textMuted}`}>
                            Supporting Evidence:
                          </span>
                          <span className={themeClasses.textSecondary}>{feat.supporting_evidence}</span>
                          {feat.evidence_url && (
                            <a
                              href={feat.evidence_url.startsWith('http') ? feat.evidence_url : `https://${feat.evidence_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-[11px] mt-1 hover:underline ${themeClasses.accentBeige}`}
                            >
                              <span>Verification Source Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SOURCES OF TRUTH                                  */}
        {/* ======================================================== */}
        {activeTab === 'sources' && selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Sources of Truth & Knowledge Grounding
                </h2>
                <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                  Authoritative documentation, whitepapers, specs, and URLs from which agents extract ground truth for {selectedProduct.name}.
                </p>
              </div>
              <button
                onClick={handleOpenAddSource}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ${themeClasses.primaryBtn}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source</span>
              </button>
            </div>

            {sources.length === 0 ? (
              <div className={`p-12 text-center rounded-xl border ${themeClasses.cardBg}`}>
                <BookOpen className={`w-8 h-8 mx-auto mb-2 opacity-30 ${themeClasses.textMuted}`} />
                <div className={`text-sm font-medium ${themeClasses.textPrimary}`}>No knowledge sources registered</div>
                <div className={`text-xs mt-1 ${themeClasses.textSecondary}`}>
                  Connect technical documentation, API specifications, or whitepapers for verifiable citations.
                </div>
                <button
                  onClick={handleOpenAddSource}
                  className={`mt-4 px-4 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 ${themeClasses.primaryBtn}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register First Knowledge Source</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((src) => (
                  <div key={src.id} className={`p-5 rounded-xl border space-y-3 ${themeClasses.cardBg}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>{src.title}</h3>
                          {src.is_primary && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#C9B49B]/20 text-[#C9B49B] border border-[#C9B49B]/40 font-semibold">
                              PRIMARY
                            </span>
                          )}
                          {src.is_verified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono-metrics uppercase tracking-wider ${themeClasses.accentBeige}`}>
                          Type: {src.source_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSource(src)}
                          className={`p-1.5 rounded hover:${themeClasses.inputBg} ${themeClasses.textSecondary}`}
                          title="Edit Source"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(src.id, src.title)}
                          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                          title="Delete Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {src.source_url && (
                      <a
                        href={src.source_url.startsWith('http') ? src.source_url : `https://${src.source_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs hover:underline ${themeClasses.accentBeige}`}
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-sm">{src.source_url}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}

                    {src.content_snippet && (
                      <div className={`p-2.5 rounded-lg border text-xs font-mono-metrics line-clamp-3 ${themeClasses.cardAlt} ${themeClasses.textSecondary}`}>
                        {src.content_snippet}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD PRODUCT (WITH ALL FIELDS & DYNAMIC FEATURES)  */}
      {/* ======================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <div>
                <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Register New Product or Service
                </h3>
                <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                  Establish a ground-truth registry entry for autonomous marketing.
                </p>
              </div>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className={`p-1.5 rounded-lg hover:${themeClasses.inputBg} ${themeClasses.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {productFormError && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Orion-9 Analytics"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Category *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="Autonomous AI / SaaS">Autonomous AI / SaaS</option>
                    <option value="Enterprise B2B">Enterprise B2B</option>
                    <option value="Consumer Tech">Consumer Tech</option>
                    <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthcare & Bio">Healthcare & Bio</option>
                    <option value="Marketing Tech">Marketing Tech</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Short punchy positioning statement"
                    value={newProdTagline}
                    onChange={(e) => setNewProdTagline(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Status
                  </label>
                  <select
                    value={newProdStatus}
                    onChange={(e) => setNewProdStatus(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="active">Active (Production)</option>
                    <option value="draft">Draft (Incubation)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newProdWebsite}
                    onChange={(e) => setNewProdWebsite(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={newProdLogoUrl}
                    onChange={(e) => setNewProdLogoUrl(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Target Market
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US Mid-Market B2B SaaS"
                    value={newProdTargetMarket}
                    onChange={(e) => setNewProdTargetMarket(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Target Audience Persona
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Marketing Officers, Solo Founders"
                    value={newProdTargetAudience}
                    onChange={(e) => setNewProdTargetAudience(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Unique Selling Proposition (USP)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10x faster autonomous marketing with 0% hallucinated claims"
                    value={newProdUsp}
                    onChange={(e) => setNewProdUsp(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    SEO Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="autonomous marketing, AI content, marketing OS, viral video"
                    value={newProdKeywords}
                    onChange={(e) => setNewProdKeywords(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detailed explanation of what the product does and how it creates value."
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Primary Objective
                  </label>
                  <input
                    type="text"
                    value={newProdObjective}
                    onChange={(e) => setNewProdObjective(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Launch Date
                  </label>
                  <input
                    type="date"
                    value={newProdLaunchDate}
                    onChange={(e) => setNewProdLaunchDate(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
              </div>

              {/* Dynamic Initial Features */}
              <div className="border-t pt-3 border-inherit">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${themeClasses.textPrimary}`}>
                    Key Product Capabilities (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewProdFeatures([...newProdFeatures, { name: '', description: '', benefit_statement: '' }])}
                    className={`text-[11px] px-2 py-0.5 rounded border flex items-center gap-1 ${themeClasses.secondaryBtn}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Capability</span>
                  </button>
                </div>

                {newProdFeatures.map((feat, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border mb-2 space-y-2 ${themeClasses.cardAlt}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono-metrics font-medium ${themeClasses.textPrimary}`}>
                        Capability #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewProdFeatures(newProdFeatures.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Capability Name"
                        value={feat.name}
                        onChange={(e) => {
                          const updated = [...newProdFeatures];
                          updated[idx].name = e.target.value;
                          setNewProdFeatures(updated);
                        }}
                        className={`w-full px-2.5 py-1 rounded text-xs border ${themeClasses.inputBg}`}
                      />
                      <input
                        type="text"
                        placeholder="Value Proposition / Benefit"
                        value={feat.benefit_statement}
                        onChange={(e) => {
                          const updated = [...newProdFeatures];
                          updated[idx].benefit_statement = e.target.value;
                          setNewProdFeatures(updated);
                        }}
                        className={`w-full px-2.5 py-1 rounded text-xs border ${themeClasses.inputBg}`}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={feat.description}
                        onChange={(e) => {
                          const updated = [...newProdFeatures];
                          updated[idx].description = e.target.value;
                          setNewProdFeatures(updated);
                        }}
                        className={`w-full px-2.5 py-1 rounded text-xs border md:col-span-2 ${themeClasses.inputBg}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="border-t pt-3 flex items-center justify-end gap-2 border-inherit">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className={`px-5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${themeClasses.primaryBtn}`}
                >
                  {isSubmittingProduct ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PRODUCT (PREPOPULATED)                      */}
      {/* ======================================================== */}
      {showEditProductModal && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <div>
                <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Edit Product: {productToEdit.name}
                </h3>
                <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                  Update product portfolio attributes, positioning, and market focus.
                </p>
              </div>
              <button 
                onClick={() => setShowEditProductModal(false)}
                className={`p-1.5 rounded-lg hover:${themeClasses.inputBg} ${themeClasses.textMuted}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Category *
                  </label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="Autonomous AI / SaaS">Autonomous AI / SaaS</option>
                    <option value="Enterprise B2B">Enterprise B2B</option>
                    <option value="Consumer Tech">Consumer Tech</option>
                    <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Healthcare & Bio">Healthcare & Bio</option>
                    <option value="Marketing Tech">Marketing Tech</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editProdTagline}
                    onChange={(e) => setEditProdTagline(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Status
                  </label>
                  <select
                    value={editProdStatus}
                    onChange={(e) => setEditProdStatus(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="active">Active (Production)</option>
                    <option value="draft">Draft (Incubation)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={editProdWebsite}
                    onChange={(e) => setEditProdWebsite(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={editProdLogoUrl}
                    onChange={(e) => setEditProdLogoUrl(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Target Market
                  </label>
                  <input
                    type="text"
                    value={editProdTargetMarket}
                    onChange={(e) => setEditProdTargetMarket(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={editProdTargetAudience}
                    onChange={(e) => setEditProdTargetAudience(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Unique Selling Proposition (USP)
                  </label>
                  <input
                    type="text"
                    value={editProdUsp}
                    onChange={(e) => setEditProdUsp(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    SEO Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editProdKeywords}
                    onChange={(e) => setEditProdKeywords(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editProdDescription}
                    onChange={(e) => setEditProdDescription(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-end gap-2 border-inherit">
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProduct}
                  className={`px-5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingProduct ? 'Saving...' : 'Update Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {showDeleteConfirmModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-rose-900/50' : 'bg-[#FFFFFF] border-rose-200'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 rounded-full bg-rose-500/10">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                  Archive Product
                </h3>
                <span className="text-xs text-rose-500">Irreversible Action Warning</span>
              </div>
            </div>

            <p className={`text-xs ${themeClasses.textSecondary}`}>
              Are you sure you want to archive <strong>{productToDelete.name}</strong>? Its associated campaigns, capabilities, brand profiles, and autonomous agent tasks will be deactivated.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-inherit">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setProductToDelete(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CAPABILITY                             */}
      {/* ======================================================== */}
      {showFeatureModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                {editingFeature ? `Edit Capability: ${editingFeature.name}` : 'Register New Verified Capability'}
              </h3>
              <button onClick={() => setShowFeatureModal(false)} className={themeClasses.textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeature} className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Capability Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Video Engine"
                  value={featName}
                  onChange={(e) => setFeatName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={featCategory}
                    onChange={(e) => setFeatCategory(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Verification Status
                  </label>
                  <select
                    value={featStatus}
                    onChange={(e) => setFeatStatus(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="verified">Verified (Ground Truth)</option>
                    <option value="pending">Pending Validation</option>
                    <option value="rejected">Rejected / Unverified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Technical Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Exact factual mechanism of how the feature works."
                  value={featDesc}
                  onChange={(e) => setFeatDesc(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Value Proposition / Benefit Statement
                </label>
                <input
                  type="text"
                  placeholder="Why this matters to the user / ROI impact"
                  value={featBenefit}
                  onChange={(e) => setFeatBenefit(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Supporting Evidence
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOC2 Report, API benchmark"
                    value={featEvidence}
                    onChange={(e) => setFeatEvidence(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Evidence URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.example.com"
                    value={featEvidenceUrl}
                    onChange={(e) => setFeatEvidenceUrl(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
              </div>

              <div className="border-t pt-3 flex justify-end gap-2 border-inherit">
                <button
                  type="button"
                  onClick={() => setShowFeatureModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeature}
                  className={`px-5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingFeature ? 'Saving...' : 'Save Capability'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT AUDIENCE PERSONA                       */}
      {/* ======================================================== */}
      {showAudienceModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                {editingAudience ? `Edit Persona: ${editingAudience.name}` : 'Create Audience Persona'}
              </h3>
              <button onClick={() => setShowAudienceModal(false)} className={themeClasses.textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAudience} className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Persona Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth-Stage CMO Clara"
                  value={audName}
                  onChange={(e) => setAudName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Persona Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary of their day-to-day priorities and pressures."
                  value={audDesc}
                  onChange={(e) => setAudDesc(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Age Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 28-42"
                    value={audAgeRange}
                    onChange={(e) => setAudAgeRange(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Occupation / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Marketing"
                    value={audOccupation}
                    onChange={(e) => setAudOccupation(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 text-rose-600 dark:text-rose-400`}>
                  Pain Points (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Slow content production cycles&#10;Inconsistent brand tone across channels"
                  value={audPainPoints}
                  onChange={(e) => setAudPainPoints(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 text-emerald-600 dark:text-emerald-400`}>
                  Needs & Desires (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Complete creative autonomy&#10;Deterministic ROI proof"
                  value={audNeeds}
                  onChange={(e) => setAudNeeds(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Preferred Social / Media Platforms (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="LinkedIn, X / Twitter, YouTube, Industry Podcasts"
                  value={audPlatforms}
                  onChange={(e) => setAudPlatforms(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div className="border-t pt-3 flex justify-end gap-2 border-inherit">
                <button
                  type="button"
                  onClick={() => setShowAudienceModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAudience}
                  className={`px-5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingAudience ? 'Saving...' : 'Save Persona'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SOURCE OF TRUTH                        */}
      {/* ======================================================== */}
      {showSourceModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E3E3DE]'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-inherit">
              <h3 className={`text-base font-bold ${themeClasses.textPrimary}`}>
                {editingSource ? `Edit Source: ${editingSource.title}` : 'Register Knowledge Source'}
              </h3>
              <button onClick={() => setShowSourceModal(false)} className={themeClasses.textMuted}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Source Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture Whitepaper v2.0"
                  value={srcTitle}
                  onChange={(e) => setSrcTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Source Type
                  </label>
                  <select
                    value={srcType}
                    onChange={(e) => setSrcType(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border cursor-pointer ${themeClasses.inputBg}`}
                  >
                    <option value="documentation">Documentation</option>
                    <option value="website">Website / Landing Page</option>
                    <option value="whitepaper">Technical Whitepaper</option>
                    <option value="api_spec">API Specification</option>
                    <option value="pitch_deck">Pitch Deck</option>
                    <option value="case_study">Case Study</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                    Verification
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={srcIsVerified}
                      onChange={(e) => setSrcIsVerified(e.target.checked)}
                      className="rounded"
                    />
                    <span>Verified Ground Truth</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Source URL
                </label>
                <input
                  type="url"
                  placeholder="https://docs.example.com"
                  value={srcUrl}
                  onChange={(e) => setSrcUrl(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border ${themeClasses.inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${themeClasses.textPrimary}`}>
                  Content Snippet / Key Excerpt
                </label>
                <textarea
                  rows={3}
                  placeholder="Authoritative text excerpt that agents can reference."
                  value={srcSnippet}
                  onChange={(e) => setSrcSnippet(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs outline-none border font-mono-metrics ${themeClasses.inputBg}`}
                />
              </div>

              <div className="border-t pt-3 flex justify-end gap-2 border-inherit">
                <button
                  type="button"
                  onClick={() => setShowSourceModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs border ${themeClasses.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSource}
                  className={`px-5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm ${themeClasses.primaryBtn}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingSource ? 'Saving...' : 'Save Knowledge Source'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
