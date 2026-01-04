
import React, { useState, useEffect } from 'react';

type BibleSubView = 'dashboard' | 'read' | 'plans' | 'library' | 'notes' | 'settings';
type LibraryTab = 'categories' | 'favorites' | 'highlights';
type PlansTab = 'my-plans' | 'browse' | 'generate';

interface Message {
  id: string;
  sender: string;
  type: 'text' | 'verse' | 'photo' | 'audio' | 'gift';
  content: string;
  timestamp: string;
  verseRef?: string;
}

interface Highlight {
  id: string;
  verseRef: string;
  text: string;
  color: string;
  dateAdded: string;
  categories: string[];
}

interface Favorite {
  id: string;
  verseRef: string;
  text: string;
  dateAdded: string;
  categories: string[];
}

interface VerseNote {
  id: string;
  verseRef: string;
  note: string;
  dateAdded: string;
}

interface LibraryCategory {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
}

const BibleStudy: React.FC = () => {
  const [currentView, setCurrentView] = useState<BibleSubView>('dashboard');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('categories');
  const [plansTab, setPlansTab] = useState<PlansTab>('my-plans');
  const [activeBook, setActiveBook] = useState('John 3');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Reading features state
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [verseNotes, setVerseNotes] = useState<VerseNote[]>([]);
  const [libraryCategories, setLibraryCategories] = useState<LibraryCategory[]>([
    { id: 'healing', name: 'Healing', count: 12, color: '#fee2e2', icon: 'favorite' },
    { id: 'mental-health', name: 'Mental Health', count: 8, color: '#f0fdf4', icon: 'psychology' },
    { id: 'prayer', name: 'Prayer Life', count: 24, color: '#eff6ff', icon: 'auto_awesome' },
    { id: 'strength', name: 'Strength', count: 15, color: '#fefce8', icon: 'fitness_center' },
    { id: 'finances', name: 'Finances', count: 5, color: '#faf5ff', icon: 'payments' },
    { id: 'wisdom', name: 'Wisdom', count: 21, color: '#fff1f2', icon: 'lightbulb' },
  ]);

  // Selection and highlighting state
  const [selectedText, setSelectedText] = useState('');
  const [selectedVerseRef, setSelectedVerseRef] = useState('');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#fef9c3');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');

  useEffect(() => {
    const handleSubNav = (e: any) => {
      if (e.detail && e.detail.subView) {
        setCurrentView(e.detail.subView as BibleSubView);
      }
    };
    window.addEventListener('hubSubNavChange', handleSubNav);
    return () => window.removeEventListener('hubSubNavChange', handleSubNav);
  }, []);

  // --- Sub-View Components ---

  const DashboardView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Bible Command Center</h1>
          <p className="text-text-muted text-sm mt-1">Welcome back to your spiritual sanctuary.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <span className="text-primary font-black text-lg">🔥 14</span>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-lg">search</span>
            <input
              type="text"
              placeholder="Search Scripture, topics, or categories..."
              className="w-full h-12 pl-12 pr-6 rounded-xl bg-white dark:bg-surface-dark border-none shadow-sm focus:ring-2 focus:ring-primary/10 text-sm font-medium"
            />
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-5 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <span className="material-symbols-outlined text-[100px]">book_5</span>
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 block">Continue Reading</span>
              <h3 className="text-xl font-black mb-2">{activeBook}</h3>
              <p className="text-text-muted text-sm max-w-md leading-relaxed mb-4 italic">
                "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish..."
              </p>
              <button
                onClick={() => setCurrentView('read')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                Open Reader
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-primary text-white rounded-2xl p-6 shadow-xl shadow-primary/20 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-lg font-bold mb-2">Daily Progress</h4>
              <p className="text-xs opacity-80 mb-6">You're ahead of schedule on your "New Testament in 90 Days" plan!</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative size-16">
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeOpacity="0.2" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeDasharray="282.6" strokeDashoffset="70" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-base">75%</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black">42/60</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">Chapters Read</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('plans')}
              className="w-full py-2.5 bg-white text-primary rounded-xl font-bold text-sm"
            >
              View Plan Details
            </button>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h4 className="font-bold mb-4 flex items-center gap-2 text-sm">
               <span className="material-symbols-outlined text-primary text-base">star</span>
               Recently Saved
             </h4>
             <div className="flex flex-col gap-2">
               {['Romans 8:28', 'Psalm 23:1', 'Philippians 4:13'].map((verse, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background-light dark:bg-background-dark hover:bg-primary/5 cursor-pointer transition-colors group">
                    <span className="text-xs font-bold">{verse}</span>
                    <span className="material-symbols-outlined text-xs text-text-muted group-hover:text-primary transition-colors">chevron_right</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handlers for reading features
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      setShowHighlightMenu(true);
    }
  };

  const handleHighlight = (color: string) => {
    if (selectedText && selectedVerseRef) {
      const newHighlight: Highlight = {
        id: `h-${Date.now()}`,
        verseRef: selectedVerseRef,
        text: selectedText,
        color,
        dateAdded: new Date().toISOString(),
        categories: []
      };
      setHighlights(prev => [...prev, newHighlight]);
      setShowHighlightMenu(false);
      setSelectedText('');
    }
  };

  const handleFavorite = () => {
    if (selectedText && selectedVerseRef) {
      const newFavorite: Favorite = {
        id: `f-${Date.now()}`,
        verseRef: selectedVerseRef,
        text: selectedText,
        dateAdded: new Date().toISOString(),
        categories: []
      };
      setFavorites(prev => [...prev, newFavorite]);
      setShowHighlightMenu(false);
      setSelectedText('');
    }
  };

  const handleAddToCategory = (categoryId: string, itemId: string, itemType: 'highlight' | 'favorite') => {
    if (itemType === 'highlight') {
      setHighlights(prev => prev.map(h =>
        h.id === itemId ? { ...h, categories: [...h.categories, categoryId] } : h
      ));
    } else {
      setFavorites(prev => prev.map(f =>
        f.id === itemId ? { ...f, categories: [...f.categories, categoryId] } : f
      ));
    }
  };

  const handleSaveNote = () => {
    if (currentNoteText.trim() && selectedVerseRef) {
      const newNote: VerseNote = {
        id: `n-${Date.now()}`,
        verseRef: selectedVerseRef,
        note: currentNoteText.trim(),
        dateAdded: new Date().toISOString()
      };
      setVerseNotes(prev => [...prev, newNote]);
      setCurrentNoteText('');
      setShowNoteModal(false);
      setSelectedText('');
      setSelectedVerseRef('');
    }
  };

  const highlightColors = [
    { name: 'Yellow', color: '#fef9c3' },
    { name: 'Green', color: '#dcfce7' },
    { name: 'Blue', color: '#e0f2fe' },
    { name: 'Purple', color: '#f5f3ff' },
    { name: 'Pink', color: '#fce7f3' },
    { name: 'Orange', color: '#fed7aa' },
  ];

  const ReadView = () => {
    const verses = [
      { num: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', ref: 'John 1:1' },
      { num: 2, text: 'He was in the beginning with God.', ref: 'John 1:2' },
      { num: 3, text: 'All things were made through him, and without him was not any thing made that was made.', ref: 'John 1:3' },
      { num: 4, text: 'In him was life, and the life was the light of men.', ref: 'John 1:4' },
      { num: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.', ref: 'John 1:5' },
      { num: 6, text: 'There was a man sent from God, whose name was John.', ref: 'John 1:6' },
      { num: 7, text: 'He came as a witness, to bear witness about the light, that all might believe through him.', ref: 'John 1:7' },
      { num: 8, text: 'He was not the light, but came to bear witness about the light.', ref: 'John 1:8' },
    ];

    return (
      <div className="flex flex-col max-w-5xl mx-auto py-6 animate-in fade-in duration-700">
        {/* Toolbar */}
        <div className="w-full flex justify-between items-center mb-6 px-4 bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors">
              {activeBook} <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
            <button className="text-xs font-bold text-text-muted hover:text-primary transition-colors">ESV</button>
          </div>
          <div className="flex gap-2">
            <button className="size-8 flex items-center justify-center rounded-lg bg-background-light dark:bg-background-dark hover:bg-primary/10"><span className="material-symbols-outlined text-sm">format_size</span></button>
            <button className="size-8 flex items-center justify-center rounded-lg bg-background-light dark:bg-background-dark hover:bg-primary/10"><span className="material-symbols-outlined text-sm">headphones</span></button>
            <button className="size-8 flex items-center justify-center rounded-lg bg-background-light dark:bg-background-dark hover:bg-primary/10"><span className="material-symbols-outlined text-sm">share</span></button>
          </div>
        </div>

        {/* Chapter Header */}
        <div className="text-center mb-6">
          <p className="text-primary font-bold text-[10px] tracking-wider uppercase mb-2">The Gospel According to</p>
          <h1 className="text-3xl font-black tracking-tight">John</h1>
          <div className="h-1 w-8 bg-primary mx-auto rounded-full mt-2"></div>
        </div>

        {/* Verses */}
        <div
          className="space-y-4 text-left leading-relaxed text-base font-medium text-text-main dark:text-gray-200 bg-white dark:bg-surface-dark rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm"
          onMouseUp={handleTextSelection}
        >
          {verses.map((verse) => {
            const verseHighlight = highlights.find(h => h.verseRef === verse.ref);
            const isFavorited = favorites.some(f => f.verseRef === verse.ref);

            return (
              <p
                key={verse.num}
                className="relative group pl-8"
                style={verseHighlight ? { backgroundColor: verseHighlight.color, padding: '8px', borderRadius: '8px' } : {}}
              >
                <span className="absolute left-0 top-0 text-[10px] font-black text-primary/40">{verse.num}</span>
                <span className="select-text">{verse.text}</span>
                <span className="inline-flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedText(verse.text);
                      setSelectedVerseRef(verse.ref);
                      setShowHighlightMenu(true);
                    }}
                    className="size-6 rounded bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-xs">palette</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedText(verse.text);
                      setSelectedVerseRef(verse.ref);
                      handleFavorite();
                    }}
                    className={`size-6 rounded flex items-center justify-center hover:bg-primary/20 ${isFavorited ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-xs">{isFavorited ? 'bookmark' : 'bookmark_border'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedText(verse.text);
                      setSelectedVerseRef(verse.ref);
                      setShowNoteModal(true);
                    }}
                    className="size-6 rounded bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-xs">edit_note</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedText(verse.text);
                      setSelectedVerseRef(verse.ref);
                      setShowCategoryModal(true);
                    }}
                    className="size-6 rounded bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"
                  >
                    <span className="material-symbols-outlined text-xs">folder</span>
                  </button>
                </span>
              </p>
            );
          })}
        </div>

        {/* Highlight Color Picker Modal */}
        {showHighlightMenu && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">Choose Highlight Color</h3>
                <button
                  onClick={() => setShowHighlightMenu(false)}
                  className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {highlightColors.map((hc) => (
                  <button
                    key={hc.name}
                    onClick={() => handleHighlight(hc.color)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 hover:border-primary transition-all"
                    style={{ backgroundColor: hc.color }}
                  >
                    <span className="text-sm font-bold text-gray-800">{hc.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFavorite}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">Add to Category</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-2">
                {libraryCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      // Add to category logic here
                      setShowCategoryModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                  >
                    <div className="size-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <span className="material-symbols-outlined text-gray-800 text-sm">{cat.icon}</span>
                    </div>
                    <span className="text-sm font-bold">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black">Add Note</h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-text-muted mb-2">{selectedVerseRef}</p>
                <p className="text-sm italic bg-background-light dark:bg-background-dark p-3 rounded-xl">"{selectedText}"</p>
              </div>
              <textarea
                className="w-full h-32 bg-background-light dark:bg-background-dark border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Write your reflection..."
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
              ></textarea>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LibraryView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Your Library</h2>
          <p className="text-text-muted mt-1 text-sm">A personalized vault of your spiritual revelations.</p>
        </div>
        <div className="flex bg-white dark:bg-surface-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setLibraryTab('categories')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${libraryTab === 'categories' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setLibraryTab('favorites')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${libraryTab === 'favorites' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Favorites
          </button>
          <button 
            onClick={() => setLibraryTab('highlights')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${libraryTab === 'highlights' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Highlights
          </button>
        </div>
      </div>

      {libraryTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-2">
          {libraryCategories.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="size-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color }}>
                <span className="material-symbols-outlined text-gray-800 text-base">{cat.icon}</span>
              </div>
              <h4 className="text-base font-bold mb-1">{cat.name}</h4>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{cat.count} Verses</p>
            </div>
          ))}
          <button className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary">
            <span className="material-symbols-outlined text-2xl">add_circle</span>
            <span className="text-xs font-bold">New Category</span>
          </button>
        </div>
      )}

      {libraryTab === 'favorites' && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2">
          {favorites.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">bookmark_border</span>
              <p className="text-sm text-text-muted font-medium">No favorites yet. Start adding verses in the Read section!</p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div key={fav.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.15em]">{fav.verseRef}</h4>
                <p className="text-sm font-medium leading-relaxed italic">"{fav.text}"</p>
                <p className="text-[10px] text-text-muted font-bold mt-1">Added {new Date(fav.dateAdded).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {libraryTab === 'highlights' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
          {highlights.length === 0 ? (
            <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">palette</span>
              <p className="text-sm text-text-muted font-medium">No highlights yet. Start highlighting verses in the Read section!</p>
            </div>
          ) : (
            highlightColors.map((colorObj) => {
              const colorHighlights = highlights.filter(h => h.color === colorObj.color);
              if (colorHighlights.length === 0) return null;

              return (
                <div key={colorObj.color} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: colorObj.color }}></div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">{colorObj.name} ({colorHighlights.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {colorHighlights.map((high) => (
                      <div key={high.id} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-3">
                        <div className="size-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: high.color }}></div>
                        <div>
                          <h4 className="text-xs font-bold mb-1">{high.verseRef}</h4>
                          <p className="text-xs text-text-muted italic">"{high.text}"</p>
                          <p className="text-[9px] text-text-muted font-bold mt-1">Added {new Date(high.dateAdded).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const NotesView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">Spiritual Reflections</h2>
        <div className="flex gap-2">
           <button className="p-2 bg-white dark:bg-surface-dark rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm"><span className="material-symbols-outlined text-base">filter_list</span></button>
           <button className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">add</span> New Note
           </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {verseNotes.length === 0 ? (
          <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">edit_note</span>
            <p className="text-sm text-text-muted font-medium">No notes yet. Start adding reflections in the Read section!</p>
          </div>
        ) : (
          verseNotes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                  <span className="material-symbols-outlined text-sm">bookmark</span> {note.verseRef}
                </div>
                <span className="text-[10px] text-text-muted font-bold">{new Date(note.dateAdded).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const PlansView = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Spiritual Pathways</h2>
          <p className="text-text-muted mt-1 text-sm">Intentionally design your walk with the Word.</p>
        </div>
        <div className="flex bg-white dark:bg-surface-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setPlansTab('my-plans')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${plansTab === 'my-plans' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            My Plans
          </button>
          <button 
            onClick={() => setPlansTab('browse')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${plansTab === 'browse' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Browse
          </button>
          <button 
            onClick={() => setPlansTab('generate')}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${plansTab === 'generate' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            AI Generator
          </button>
        </div>
      </div>

      {plansTab === 'my-plans' && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
           {/* Active Plan Resume Card */}
           <div className="bg-primary text-white rounded-2xl p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-6 opacity-5 transform -rotate-12">
                <span className="material-symbols-outlined text-[100px]">auto_stories</span>
              </div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 block">Currently Reading</span>
                    <h3 className="text-2xl font-black mb-3">New Testament in 90 Days</h3>
                    <p className="text-white/80 text-xs leading-relaxed mb-4">Day 42: You're currently exploring the miracles in the Gospel of Mark. Keep the momentum!</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => setCurrentView('read')} className="bg-white text-primary px-6 py-2.5 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                       Resume: Mark 5
                     </button>
                     <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl font-bold text-sm transition-all">
                       View Calendar
                     </button>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center lg:items-end">
                  <div className="relative size-32">
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeOpacity="0.1" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeDasharray="282.6" strokeDashoffset="70" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black leading-none">75%</span>
                      <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">Complete</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-bold opacity-70">Estimated completion: Nov 12</p>
                </div>
              </div>
           </div>

           {/* Completed / Other Plans */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Psalms of Comfort', status: 'Paused', prog: 30, color: '#fefce8', text: 'yellow-700' },
                { title: 'The Parables of Jesus', status: 'Completed', prog: 100, color: '#f0fdf4', text: 'emerald-700' },
              ].map((plan, i) => (
                <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: plan.color }}>
                         <span className={`material-symbols-outlined text-base text-${plan.text}`}>{plan.prog === 100 ? 'verified' : 'hourglass_bottom'}</span>
                      </div>
                      <div>
                         <h4 className="font-bold text-base">{plan.title}</h4>
                         <span className="text-[10px] font-bold text-text-muted">{plan.status} • {plan.prog}%</span>
                      </div>
                   </div>
                   <button className="material-symbols-outlined text-base text-text-muted hover:text-primary transition-colors">settings</button>
                </div>
              ))}
           </div>
        </div>
      )}

      {plansTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4">
           {[
             { title: 'The Gospels', dur: '30 Days', tag: 'Essentials', img: 'https://picsum.photos/id/1011/400/300' },
             { title: 'Strength in Trials', dur: '14 Days', tag: 'Topical', img: 'https://picsum.photos/id/1015/400/300' },
             { title: 'Proverbs for Business', dur: '31 Days', tag: 'Wisdom', img: 'https://picsum.photos/id/1016/400/300' },
             { title: 'Old Testament History', dur: '1 Year', tag: 'Academic', img: 'https://picsum.photos/id/1018/400/300' },
             { title: 'Faith & Motherhood', dur: '21 Days', tag: 'Life Season', img: 'https://picsum.photos/id/1019/400/300' },
             { title: 'The Heart of David', dur: '10 Days', tag: 'Characters', img: 'https://picsum.photos/id/1020/400/300' },
           ].map((item, i) => (
             <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group cursor-pointer hover:shadow-xl transition-all">
                <div className="h-36 overflow-hidden relative">
                   <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-primary">{item.tag}</div>
                </div>
                <div className="p-6">
                   <h4 className="text-base font-black mb-2">{item.title}</h4>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">
                      <span className="material-symbols-outlined text-xs">schedule</span> {item.dur}
                   </div>
                   <button className="w-full py-2.5 border border-primary/20 text-primary font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-all">Start Plan</button>
                </div>
             </div>
           ))}
        </div>
      )}

      {plansTab === 'generate' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-surface-dark rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl animate-in zoom-in duration-500">
           <div className="text-center mb-8">
              <span className="material-symbols-outlined text-primary text-5xl mb-3">auto_fix_high</span>
              <h3 className="text-2xl font-black mb-2 tracking-tight">AI Plan Architect</h3>
              <p className="text-text-muted text-sm font-medium">Manifest a custom reading season based on your unique spiritual goal.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">My Current Focus</label>
                    <textarea
                       placeholder="e.g., I'm feeling anxious about my career path and need peace..."
                       className="w-full h-24 bg-background-light dark:bg-background-dark border-none rounded-2xl p-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all"
                    ></textarea>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Intensity</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Casual', 'Balanced', 'Deep'].map(opt => (
                         <button key={opt} className={`py-2 rounded-xl text-xs font-bold border ${opt === 'Balanced' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-gray-100 dark:border-gray-800'}`}>
                           {opt}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col justify-between">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Duration</label>
                    <div className="flex flex-wrap gap-2">
                       {['7 Days', '14 Days', '30 Days', '90 Days', '1 Year'].map(d => (
                         <button key={d} className="px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 text-[9px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all">{d}</button>
                       ))}
                    </div>
                 </div>
                 <div className="mt-6">
                    <button className="w-full h-12 bg-primary text-white rounded-xl font-black text-base shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                       Generate Sacred Path
                       <span className="material-symbols-outlined">bolt</span>
                    </button>
                    <p className="text-center text-[9px] text-text-muted font-bold uppercase tracking-widest mt-3">Powered by LuxeAI Scripture Engine</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'read': return <ReadView />;
      case 'library': return <LibraryView />;
      case 'notes': return <NotesView />;
      case 'plans': return <PlansView />;
      case 'settings':
        return (
          <div className="max-w-2xl bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 animate-in fade-in duration-700">
             <h2 className="text-2xl font-black mb-8">Sacred Preferences</h2>
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <div>
                      <p className="font-bold">Default Translation</p>
                      <p className="text-xs text-text-muted">Choose your preferred interpretation.</p>
                   </div>
                   <select className="bg-background-light dark:bg-background-dark border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-primary/20">
                      <option>ESV - English Standard</option>
                      <option>NIV - New International</option>
                      <option>KJV - King James</option>
                   </select>
                </div>
                <div className="flex justify-between items-center">
                   <div>
                      <p className="font-bold">Sacred Focus Mode</p>
                      <p className="text-xs text-text-muted">Hide all UI elements during deep reading.</p>
                   </div>
                   <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer"><span className="material-symbols-outlined">toggle_on</span></div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default BibleStudy;
