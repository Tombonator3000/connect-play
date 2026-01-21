import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Save,
  Trash2,
  X,
  Check,
  AlertTriangle,
  HardDrive,
  Cloud,
  Clock,
  Users,
  Coins,
  FileJson
} from 'lucide-react';
import { LegacyData, GameState } from '../types';
import {
  exportLegacyData,
  exportFullSave,
  importSaveFile,
  applySaveFile,
  getSaveSlots,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  hasAutoSave,
  loadAutoSave,
  clearAutoSave,
  SaveSlot,
  SaveFile
} from '../utils/saveManager';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  legacyData: LegacyData;
  gameState?: Partial<GameState>;
  onLoadLegacyData: (data: LegacyData) => void;
  onLoadGameState?: (state: Partial<GameState>) => void;
}

type TabType = 'local' | 'export' | 'import';

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  legacyData,
  gameState,
  onLoadLegacyData,
  onLoadGameState
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [slots, setSlots] = useState<SaveSlot[]>(() => getSaveSlots());
  const [newSlotName, setNewSlotName] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importedFile, setImportedFile] = useState<SaveFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveToSlot = () => {
    if (!newSlotName.trim()) return;

    const slotId = `slot_${Date.now()}`;
    saveToSlot(slotId, newSlotName.trim(), legacyData, gameState);
    setSlots(getSaveSlots());
    setNewSlotName('');
  };

  const handleLoadSlot = (slotId: string) => {
    const saveFile = loadFromSlot(slotId);
    if (!saveFile) return;

    if (saveFile.legacyData) {
      onLoadLegacyData(saveFile.legacyData);
    }
    if (saveFile.gameState && onLoadGameState) {
      onLoadGameState(saveFile.gameState);
    }
    onClose();
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSlot(slotId);
    setSlots(getSaveSlots());
    setShowConfirmDelete(null);
  };

  const handleLoadAutoSave = () => {
    const autoSave = loadAutoSave();
    if (!autoSave) return;

    if (autoSave.legacyData) {
      onLoadLegacyData(autoSave.legacyData);
    }
    if (autoSave.gameState && onLoadGameState) {
      onLoadGameState(autoSave.gameState);
    }
    onClose();
  };

  const handleExportHeroes = () => {
    exportLegacyData(legacyData);
  };

  const handleExportFull = () => {
    exportFullSave(legacyData, gameState);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    setImportedFile(null);

    const result = await importSaveFile(file);

    if (result.success && result.saveFile) {
      setImportedFile(result.saveFile);
      setImportStatus({ type: 'success', message: 'Save file loaded successfully!' });
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Failed to load save file' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyImport = () => {
    if (!importedFile) return;

    const applied = applySaveFile(importedFile);

    if (applied.legacyData) {
      onLoadLegacyData(applied.legacyData);
    }
    if (applied.gameState && onLoadGameState) {
      onLoadGameState(applied.gameState);
    }

    setImportedFile(null);
    setImportStatus(null);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80">
      <div className="bg-card w-full max-w-2xl rounded-2xl border-2 border-primary shadow-[var(--shadow-doom)] overflow-hidden">
        {/* Header */}
        <div className="bg-primary/20 p-4 border-b border-primary/30 flex items-center justify-between">
          <h2 className="text-xl font-display text-primary uppercase tracking-widest flex items-center gap-2">
            <HardDrive size={20} />
            Save / Load Game
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 p-3 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'local'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Save size={16} className="inline mr-2" />
            Local Saves
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 p-3 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'export'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download size={16} className="inline mr-2" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 p-3 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'import'
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Import
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Local Saves Tab */}
          {activeTab === 'local' && (
            <div className="space-y-6">
              {/* New save slot */}
              <div className="bg-background/50 p-4 rounded-xl border border-border">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Create New Save</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    placeholder="Enter save name..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSaveToSlot}
                    disabled={!newSlotName.trim()}
                    className={`px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                      newSlotName.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </div>

              {/* Auto-save */}
              {hasAutoSave() && (
                <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-amber-400 flex items-center gap-2">
                        <Clock size={16} />
                        Auto-Save Available
                      </h3>
                      <p className="text-xs text-amber-300/70 mt-1">Automatically saved game progress</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadAutoSave}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          clearAutoSave();
                          setSlots(getSaveSlots()); // Force re-render
                        }}
                        className="px-4 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save slots */}
              <div className="space-y-3">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Saved Games</h3>
                {slots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 italic">No saved games yet</p>
                ) : (
                  slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-background/50 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-foreground">{slot.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(slot.timestamp)}
                            </span>
                            {slot.heroCount !== undefined && (
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {slot.heroCount} heroes
                              </span>
                            )}
                            {slot.gold !== undefined && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Coins size={12} />
                                {slot.gold}
                              </span>
                            )}
                          </div>
                          {slot.scenarioTitle && (
                            <div className="text-xs text-primary mt-1">{slot.scenarioTitle}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadSlot(slot.id)}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-bold"
                          >
                            Load
                          </button>
                          {showConfirmDelete === slot.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setShowConfirmDelete(null)}
                                className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowConfirmDelete(slot.id)}
                              className="px-3 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg text-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Download your game data as a file. You can use this to backup your progress or transfer it to another device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Heroes Only */}
                <button
                  onClick={handleExportHeroes}
                  className="p-6 bg-background/50 border-2 border-border hover:border-primary rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Users size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        Export Heroes
                      </h3>
                      <p className="text-xs text-muted-foreground">Legacy heroes, gold, and stash</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {legacyData.heroes.length} heroes
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins size={12} /> {legacyData.totalGoldEarned || 0} gold
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-primary text-sm font-bold">
                    <Download size={16} />
                    Download JSON
                  </div>
                </button>

                {/* Export Full Save */}
                <button
                  onClick={handleExportFull}
                  className="p-6 bg-background/50 border-2 border-border hover:border-amber-500 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-amber-500/20 rounded-lg">
                      <HardDrive size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-amber-400 transition-colors">
                        Export Full Save
                      </h3>
                      <p className="text-xs text-muted-foreground">Heroes + current game state</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Includes all data for complete backup
                    {gameState?.activeScenario && (
                      <div className="text-primary mt-1">
                        + Active scenario: {gameState.activeScenario.title}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm font-bold">
                    <Download size={16} />
                    Download Full Backup
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-700 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-400">Warning</h4>
                  <p className="text-xs text-amber-300/70">
                    Importing a save file will replace your current data. Make sure to export a backup first if needed.
                  </p>
                </div>
              </div>

              {/* File upload */}
              <div className="bg-background/50 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="save-file-input"
                />
                <label
                  htmlFor="save-file-input"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 bg-primary/10 rounded-full">
                    <FileJson size={32} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Click to select a save file</p>
                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Supports .json files</p>
                </label>
              </div>

              {/* Import status */}
              {importStatus && (
                <div className={`p-4 rounded-xl border ${
                  importStatus.type === 'success'
                    ? 'bg-green-950/30 border-green-700'
                    : 'bg-red-950/30 border-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {importStatus.type === 'success' ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <X size={20} className="text-red-400" />
                    )}
                    <span className={importStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {importStatus.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Imported file preview */}
              {importedFile && (
                <div className="bg-green-950/20 p-4 rounded-xl border border-green-700">
                  <h4 className="font-bold text-green-400 mb-3">Ready to Import</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 text-foreground capitalize">{importedFile.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2 text-foreground">{formatDate(importedFile.timestamp)}</span>
                    </div>
                    {importedFile.legacyData && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Heroes:</span>
                          <span className="ml-2 text-foreground">{importedFile.legacyData.heroes.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gold:</span>
                          <span className="ml-2 text-amber-400">{importedFile.legacyData.totalGoldEarned || 0}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleApplyImport}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Apply Import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;
