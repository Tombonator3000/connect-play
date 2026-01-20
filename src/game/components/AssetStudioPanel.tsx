/**
 * Asset Studio Panel - Generative Art Pipeline UI
 *
 * Provides interface for:
 * - Viewing all game assets and their generation status
 * - Configuring API key for Gemini
 * - Batch generating missing assets
 * - Exporting/importing asset libraries
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw, Download, Upload, Key, Check, X, AlertCircle,
  Image, MapPin, Skull, User, Play, Pause, Trash2, Eye, EyeOff
} from 'lucide-react';
import {
  getAllAssetDefinitions,
  getAssetCounts,
  getMissingAssets,
  generateAssetBatch,
  addAssetsToLibrary,
  exportLibraryAsJson,
  importLibraryFromJson,
  clearAssetLibrary,
  getStoredApiKey,
  setStoredApiKey,
  removeStoredApiKey,
  GenerationProgress,
  AssetDefinition,
  AssetCategory
} from '../utils/AssetGenerationService';

// ============================================================================
// TYPES
// ============================================================================

type CategoryFilter = 'all' | AssetCategory;

interface AssetStudioPanelProps {
  onClose?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const AssetStudioPanel: React.FC<AssetStudioPanelProps> = () => {
  // State
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [assetCounts, setAssetCounts] = useState(getAssetCounts());

  // Ref for abort signal
  const abortSignalRef = useRef({ aborted: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stored API key on mount
  useEffect(() => {
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setHasStoredKey(true);
    }
    refreshCounts();
  }, []);

  // Refresh asset counts
  const refreshCounts = useCallback(() => {
    setAssetCounts(getAssetCounts());
  }, []);

  // Handle API key save
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setStoredApiKey(apiKey.trim());
      setHasStoredKey(true);
      setStatusMessage('API-nøkkel lagret');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Handle API key remove
  const handleRemoveApiKey = () => {
    removeStoredApiKey();
    setApiKey('');
    setHasStoredKey(false);
    setStatusMessage('API-nøkkel fjernet');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Get filtered missing assets
  const getFilteredMissingAssets = useCallback((): AssetDefinition[] => {
    const allAssets = getAllAssetDefinitions();
    const missing = getMissingAssets(allAssets);

    if (categoryFilter === 'all') {
      return missing;
    }
    return missing.filter(a => a.category === categoryFilter);
  }, [categoryFilter]);

  // Start batch generation
  const handleStartGeneration = async () => {
    const currentKey = apiKey.trim() || getStoredApiKey();
    if (!currentKey) {
      setStatusMessage('Vennligst oppgi en Gemini API-nøkkel');
      return;
    }

    const missingAssets = getFilteredMissingAssets();
    if (missingAssets.length === 0) {
      setStatusMessage('Ingen manglende assets å generere');
      return;
    }

    setIsGenerating(true);
    abortSignalRef.current = { aborted: false };

    try {
      const results = await generateAssetBatch(
        missingAssets,
        currentKey,
        (prog) => setProgress({ ...prog }),
        abortSignalRef.current,
        2000 // 2 second delay between requests for rate limiting
      );

      if (results.size > 0) {
        const saved = addAssetsToLibrary(results);
        if (saved) {
          setStatusMessage(`${results.size} assets generert og lagret!`);
        } else {
          setStatusMessage(`${results.size} assets generert, men lagring feilet (cache full?)`);
        }
      }
    } catch (error) {
      setStatusMessage(`Feil: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    } finally {
      setIsGenerating(false);
      refreshCounts();
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    abortSignalRef.current.aborted = true;
    setStatusMessage('Stopper generering...');
  };

  // Export assets
  const handleExport = () => {
    exportLibraryAsJson();
    setStatusMessage('Assets eksportert!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Import assets
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importLibraryFromJson(file);
    if (result.success) {
      setStatusMessage(`${result.count} assets importert!`);
      refreshCounts();
    } else {
      setStatusMessage(`Import feilet: ${result.error}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(() => setStatusMessage(''), 5000);
  };

  // Clear all assets
  const handleClearAssets = () => {
    if (confirm('Er du sikker på at du vil slette alle genererte assets? Statiske fallback-bilder beholdes.')) {
      clearAssetLibrary();
      refreshCounts();
      setStatusMessage('Alle genererte assets slettet');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'tile': return <MapPin size={14} />;
      case 'monster': return <Skull size={14} />;
      case 'character': return <User size={14} />;
      default: return <Image size={14} />;
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with counts */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-gold uppercase tracking-wider">
          Generative Art Pipeline
        </h2>
        <div className="text-muted-foreground text-sm">
          {assetCounts.total.generated} / {assetCounts.total.total} Assets
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/50 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <MapPin size={12} /> Lokasjoner
          </div>
          <div className="text-xl font-bold text-primary">
            {assetCounts.tiles.generated} / {assetCounts.tiles.total}
          </div>
        </div>
        <div className="bg-card/50 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <Skull size={12} /> Monstre
          </div>
          <div className="text-xl font-bold text-primary">
            {assetCounts.monsters.generated} / {assetCounts.monsters.total}
          </div>
        </div>
        <div className="bg-card/50 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
            <User size={12} /> Karakterer
          </div>
          <div className="text-xl font-bold text-primary">
            {assetCounts.characters.generated} / {assetCounts.characters.total}
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-card/50 p-4 rounded-xl border border-border space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
          <Key size={12} /> Google Gemini API-nøkkel
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasStoredKey ? '••••••••••••••••' : 'Lim inn din API-nøkkel'}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {apiKey && (
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg flex items-center gap-2"
            >
              <Check size={16} />
            </button>
          )}
          {hasStoredKey && (
            <button
              onClick={handleRemoveApiKey}
              className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg flex items-center gap-2 border border-destructive/50"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Hent din gratis API-nøkkel fra{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {(['all', 'tile', 'monster', 'character'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat === 'all' ? <Image size={14} /> : getCategoryIcon(cat)}
            {cat === 'all' ? 'Alle' : cat === 'tile' ? 'Tiles' : cat === 'monster' ? 'Monstre' : 'Karakterer'}
          </button>
        ))}
      </div>

      {/* Generation Controls */}
      <div className="bg-card/50 p-4 rounded-xl border border-border space-y-4">
        {/* Progress Bar */}
        {progress && isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {progress.current ? `Genererer: ${progress.current}` : 'Venter...'}
              </span>
              <span className="text-primary font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.completed} fullført</span>
              {progress.failed > 0 && (
                <span className="text-destructive">{progress.failed} feilet</span>
              )}
              <span>{progress.total - progress.completed - progress.failed} gjenstår</span>
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
            statusMessage.includes('Feil') || statusMessage.includes('feilet')
              ? 'bg-destructive/20 text-destructive'
              : 'bg-primary/20 text-primary'
          }`}>
            {statusMessage.includes('Feil') || statusMessage.includes('feilet')
              ? <AlertCircle size={16} />
              : <Check size={16} />
            }
            {statusMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          {!isGenerating ? (
            <button
              onClick={handleStartGeneration}
              disabled={!hasStoredKey && !apiKey}
              className="px-6 py-3 bg-accent hover:bg-accent/80 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
            >
              <Play size={18} />
              Generer {getFilteredMissingAssets().length} Manglende
            </button>
          ) : (
            <button
              onClick={handleStopGeneration}
              className="px-6 py-3 bg-destructive hover:bg-destructive/80 text-destructive-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
            >
              <Pause size={18} />
              Stopp
            </button>
          )}

          <button
            onClick={handleExport}
            className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors border border-border"
          >
            <Download size={18} />
            Eksporter
          </button>

          <label className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors border border-border cursor-pointer">
            <Upload size={18} />
            Importer
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={refreshCounts}
            className="px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg flex items-center gap-2 transition-colors border border-border"
            title="Oppdater telling"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Error List */}
        {progress && progress.errors.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-bold text-destructive">Feil under generering:</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {progress.errors.slice(0, 10).map((err, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  <span className="text-destructive">{err.assetId}:</span> {err.error}
                </div>
              ))}
              {progress.errors.length > 10 && (
                <div className="text-xs text-muted-foreground">
                  ...og {progress.errors.length - 10} flere feil
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-card/30 p-4 rounded-xl border border-border/50 space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Om Asset Studio:</strong> Dette verktøyet bruker Google Gemini 2.0 Flash
          for å generere unike spillbilder. Bildene lagres i nettleserens cache (localStorage) og brukes
          i stedet for standard-grafikken.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Fallback:</strong> Hvis generering feiler eller API-nøkkel mangler,
          brukes standard-grafikken som ligger i prosjektet for monstre og karakterer.
          Lokasjoner vises uten bilde.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-border/50 pt-4">
        <button
          onClick={handleClearAssets}
          className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2 border border-destructive/30"
        >
          <Trash2 size={14} />
          Slett alle genererte assets
        </button>
      </div>
    </div>
  );
};

export default AssetStudioPanel;
