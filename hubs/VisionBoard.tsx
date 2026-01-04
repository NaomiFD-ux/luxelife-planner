
import React, { useState } from 'react';

type VisionType = 'quote' | 'image' | 'goal';
type ImageSourceType = 'url' | 'search';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface VisionItem {
  id: string;
  type: VisionType;
  content?: string; // For quotes
  url?: string; // For images
  title?: string; // For goals
  label?: string; // For images
  target?: string; // For goals
  progress?: number; // For goals
  size?: 'small' | 'medium' | 'large';
  color?: string;
  icon?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}

const VisionBoard: React.FC = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([
    { id: '1', type: 'quote', content: 'Design a life you love.', size: 'large', color: '#fceef5', notes: 'This is my core philosophy for 2024.' },
    { id: '2', type: 'image', url: 'https://picsum.photos/id/10/800/600', label: 'Adventure', notes: 'I want to visit at least 3 new countries this year.' },
    { id: '3', type: 'goal', title: 'Luxury Penthouse', target: '$2.5M', progress: 45, icon: 'home', notes: 'Looking at properties in Manhattan and Dubai.', checklist: [{ id: 'cl1', text: 'Research market trends', completed: true }, { id: 'cl2', text: 'Consult financial advisor', completed: false }] },
    { id: '4', type: 'image', url: 'https://picsum.photos/id/20/800/1200', label: 'Mindset', notes: 'Daily meditation is the key to clarity.' },
    { id: '5', type: 'quote', content: 'Abundance is my birthright.', size: 'small', color: '#eff6ff' },
    { id: '6', type: 'image', url: 'https://picsum.photos/id/30/800/800', label: 'Success' },
    { id: '7', type: 'goal', title: 'World Tour', target: '12 Countries', progress: 70, icon: 'flight' },
  ]);

  const [selectedVision, setSelectedVision] = useState<VisionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [resizingItem, setResizingItem] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleAddVision = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as VisionType;
    
    const newItem: VisionItem = {
      id: Date.now().toString(),
      type,
      content: formData.get('content') as string,
      url: formData.get('url') as string,
      title: formData.get('title') as string,
      label: formData.get('label') as string,
      target: formData.get('target') as string,
      progress: formData.get('progress') ? Number(formData.get('progress')) : 0,
      icon: formData.get('icon') as string || 'star',
      color: formData.get('color') as string || '#f8f5f7',
      size: 'large',
      checklist: []
    };

    setVisionItems([newItem, ...visionItems]);
    setIsAddModalOpen(false);
  };

  const updateVision = (updated: VisionItem) => {
    setVisionItems(visionItems.map(item => item.id === updated.id ? updated : item));
    setSelectedVision(updated);
  };

  const deleteVision = (id: string) => {
    setVisionItems(visionItems.filter(item => item.id !== id));
    setActiveMenuId(null);
  };

  const AddVisionModal = () => {
    const [selectedType, setSelectedType] = useState<VisionType>('image');
    const [imageSource, setImageSource] = useState<ImageSourceType>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState('');

    const handleImageSearch = () => {
      // Simulated image search - in production, use Unsplash API or similar
      const mockResults = [
        'https://picsum.photos/id/10/800/600',
        'https://picsum.photos/id/20/800/600',
        'https://picsum.photos/id/30/800/600',
        'https://picsum.photos/id/40/800/600',
        'https://picsum.photos/id/50/800/600',
        'https://picsum.photos/id/60/800/600',
        'https://picsum.photos/id/70/800/600',
        'https://picsum.photos/id/80/800/600',
      ];
      setSearchResults(mockResults);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsAddModalOpen(false)}></div>
        <div className="bg-white dark:bg-surface-dark w-full max-w-3xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-surface-dark">
            <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Manifest New Vision</h3>
            <button onClick={() => setIsAddModalOpen(false)} className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted hover:text-primary transition-all">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <form onSubmit={handleAddVision} className="p-6 space-y-6">
            <div className="flex gap-2 p-1 bg-background-light dark:bg-background-dark rounded-2xl">
              {(['image', 'quote', 'goal'] as VisionType[]).map(t => (
                <button 
                  key={t} 
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === t ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-text-muted'}`}
                >
                  <input type="radio" name="type" value={t} checked={selectedType === t} className="sr-only" readOnly />
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {selectedType === 'image' && (
                <>
                  <div className="flex gap-2 p-1 bg-background-light dark:bg-background-dark rounded-xl">
                    <button
                      type="button"
                      onClick={() => setImageSource('search')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageSource === 'search' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-text-muted'}`}
                    >
                      Search Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource('url')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageSource === 'url' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-text-muted'}`}
                    >
                      Image URL
                    </button>
                  </div>

                  {imageSource === 'search' ? (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for inspiration..."
                          className="flex-1 h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleImageSearch}
                          className="h-12 px-6 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                          Search
                        </button>
                      </div>
                      {searchResults.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                          {searchResults.map((url, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedImage(url)}
                              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${selectedImage === url ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent'}`}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              {selectedImage === url && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="hidden" name="url" value={selectedImage} />
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Image URL</label>
                      <input name="url" required placeholder="https://..." className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary">Label</label>
                    <input name="label" required placeholder="e.g., European Summer" className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                  </div>
                </>
              )}
              {selectedType === 'quote' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Affirmation</label>
                    <textarea name="content" required placeholder="Type your powerful quote..." className="w-full h-32 bg-background-light dark:bg-background-dark border-none rounded-3xl p-6 font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white resize-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Color Aesthetic</label>
                    <div className="flex gap-3">
                      {['#fceef5', '#eff6ff', '#f0fdf4', '#fff7ed'].map(c => (
                        <label key={c} className="relative cursor-pointer">
                          <input type="radio" name="color" value={c} defaultChecked={c === '#fceef5'} className="sr-only peer" />
                          <div className="size-10 rounded-full border-2 border-transparent peer-checked:border-primary transition-all" style={{ backgroundColor: c }}></div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {selectedType === 'goal' && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Goal Title</label>
                    <input name="title" required placeholder="e.g., Porsche 911 GT3" className="w-full h-14 bg-background-light dark:bg-background-dark border-none rounded-2xl px-6 font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary">Target</label>
                      <input name="target" required placeholder="$200,000" className="w-full h-14 bg-background-light dark:bg-background-dark border-none rounded-2xl px-6 font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary">Progress %</label>
                      <input name="progress" type="number" defaultValue="0" max="100" className="w-full h-14 bg-background-light dark:bg-background-dark border-none rounded-2xl px-6 font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={selectedType === 'image' && imageSource === 'search' && !selectedImage}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Board
            </button>
          </form>
        </div>
      </div>
    );
  };

  const VisionDetailModal = () => {
    if (!selectedVision) return null;
    const [noteText, setNoteText] = useState(selectedVision.notes || '');
    const [newItemText, setNewItemText] = useState('');

    const toggleCheck = (cid: string) => {
      const updatedList = (selectedVision.checklist || []).map(item => 
        item.id === cid ? { ...item, completed: !item.completed } : item
      );
      updateVision({ ...selectedVision, checklist: updatedList });
    };

    const addChecklistItem = () => {
      if (!newItemText.trim()) return;
      const newItem = { id: Date.now().toString(), text: newItemText, completed: false };
      updateVision({ ...selectedVision, checklist: [...(selectedVision.checklist || []), newItem] });
      setNewItemText('');
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" onClick={() => setSelectedVision(null)}></div>
        <div className="bg-white dark:bg-surface-dark w-full max-w-4xl rounded-[64px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/10 flex flex-col md:flex-row h-[80vh]">
          <div className="w-full md:w-2/5 bg-background-light dark:bg-background-dark p-12 flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-800">
            {selectedVision.type === 'image' && (
              <div className="w-full h-full flex flex-col gap-6">
                <img src={selectedVision.url} className="w-full h-full object-cover rounded-[40px] shadow-2xl" alt={selectedVision.label} />
                <h3 className="text-3xl font-black tracking-tight text-center">{selectedVision.label}</h3>
              </div>
            )}
            {selectedVision.type === 'quote' && (
              <div className="p-12 rounded-[48px] w-full text-center shadow-xl border-2 border-primary/10" style={{ backgroundColor: selectedVision.color }}>
                <span className="material-symbols-outlined text-primary text-6xl mb-6">format_quote</span>
                <p className="text-3xl font-black leading-tight">{selectedVision.content}</p>
              </div>
            )}
            {selectedVision.type === 'goal' && (
              <div className="w-full space-y-8">
                <div className="size-24 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-lg">
                  <span className="material-symbols-outlined text-4xl">{selectedVision.icon}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-black mb-2">{selectedVision.title}</h3>
                  <p className="text-text-muted font-bold tracking-widest uppercase text-xs">Target: {selectedVision.target}</p>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${selectedVision.progress}%` }}></div>
                  </div>
                  <p className="text-center font-black text-primary text-xl">{selectedVision.progress}% Manifested</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-12 overflow-y-auto no-scrollbar flex flex-col gap-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Intention & Reflections</h4>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={() => updateVision({ ...selectedVision, notes: noteText })}
                placeholder="Why is this vision important to you? Speak your intention into existence..."
                className="w-full min-h-[200px] bg-background-light dark:bg-background-dark border-none rounded-[40px] p-8 text-base font-medium leading-relaxed focus:ring-4 focus:ring-primary/5 transition-all text-text-main dark:text-white"
              />
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Manifestation Roadmap</h4>
              <div className="space-y-3">
                {(selectedVision.checklist || []).map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-5 bg-background-light dark:bg-background-dark rounded-3xl border border-transparent hover:border-primary/10 transition-all group">
                    <button 
                      onClick={() => toggleCheck(item.id)}
                      className={`size-7 rounded-xl flex items-center justify-center border-2 transition-all ${item.completed ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      {item.completed && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                    <span className={`text-sm font-bold flex-1 ${item.completed ? 'line-through text-text-muted opacity-50' : 'text-text-main dark:text-gray-200'}`}>{item.text}</span>
                  </div>
                ))}
                <div className="flex gap-3">
                  <input 
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                    placeholder="Add a milestone step..." 
                    className="flex-1 h-14 bg-background-light dark:bg-background-dark border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20" 
                  />
                  <button onClick={addChecklistItem} className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedVision(null)} className="w-full py-4 bg-text-main dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm mt-auto shadow-xl">Close Vision</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 relative h-full px-4 md:px-8 lg:px-10 pt-2 pb-10">
      {isAddModalOpen && <AddVisionModal />}
      {selectedVision && <VisionDetailModal />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">Vision 2024</h1>
          <p className="text-text-muted text-base mt-2 font-medium">
            {editMode ? (
              <>
                <span className="text-primary font-bold">Edit Mode Active:</span> Click resize to change size • Click delete to remove
              </>
            ) : (
              'Manifesting a reality of luxury, purpose, and impact.'
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-3 rounded-2xl font-bold shadow-sm border flex items-center gap-2 transition-all ${editMode ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:bg-gray-50 text-text-main dark:text-white'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{editMode ? 'check' : 'edit'}</span>
            {editMode ? 'Done' : 'Edit Mode'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Vision
          </button>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-20">
        {visionItems.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid animate-in fade-in zoom-in duration-500 relative group"
          >
            {editMode && (
              <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button
                  onClick={() => {
                    const newSize = item.size === 'large' ? 'medium' : item.size === 'medium' ? 'small' : 'large';
                    updateVision({ ...item, size: newSize });
                  }}
                  className="size-8 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
                  title="Resize"
                >
                  <span className="material-symbols-outlined text-sm">photo_size_select_large</span>
                </button>
                <button
                  onClick={() => deleteVision(item.id)}
                  className="size-8 rounded-lg bg-rose-500/90 backdrop-blur-sm text-white flex items-center justify-center hover:bg-rose-600 transition-all"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            )}
            {item.type === 'quote' && (
              <div
                onClick={() => !editMode && setSelectedVision(item)}
                className={`p-10 rounded-[32px] text-center flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-all border-2 ${editMode ? 'border-primary/40' : 'border-transparent hover:border-primary/20'} ${editMode ? '' : 'cursor-pointer'}`}
                style={{ backgroundColor: item.color }}
              >
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform">format_quote</span>
                <p className={`font-black tracking-tight text-text-main ${item.size === 'large' ? 'text-3xl' : item.size === 'medium' ? 'text-2xl' : 'text-xl'}`}>{item.content}</p>
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">Manifestation</span>
              </div>
            )}

            {item.type === 'image' && (
              <div
                onClick={() => !editMode && setSelectedVision(item)}
                className={`relative rounded-[32px] overflow-hidden group hover:shadow-2xl transition-all border-2 ${editMode ? 'border-primary/40 cursor-default' : 'border-transparent cursor-pointer'}`}
              >
                <img src={item.url} alt={item.label} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent ${editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex flex-col justify-end p-8`}>
                  <p className="text-white font-bold text-xl">{item.label}</p>
                  {item.notes && <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-2">Has Notes</span>}
                </div>
              </div>
            )}

            {item.type === 'goal' && (
              <div
                className={`bg-white dark:bg-surface-dark p-8 rounded-[32px] border shadow-sm hover:shadow-xl transition-all relative ${editMode ? 'border-primary/40 cursor-default' : 'border-gray-100 dark:border-gray-800 cursor-pointer'}`}
                onClick={() => !editMode && setSelectedVision(item)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 text-text-main dark:text-white">{item.title}</h3>
                <p className="text-sm text-text-muted mb-6">Target: {item.target}</p>
                <div className="w-full bg-background-light dark:bg-background-dark h-2.5 rounded-full overflow-hidden mb-3">
                  <div className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(244,37,140,0.3)]" style={{ width: `${item.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                  <span>Progress</span>
                  <span className="text-primary">{item.progress}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisionBoard;
