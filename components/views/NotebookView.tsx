import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Folder, Note } from "../../types.ts";

const NotebookView: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([
    { id: "f-1", name: "Trade Notes" },
    { id: "f-2", name: "Daily Journal" },
    { id: "f-3", name: "Sessions Recap" },
  ]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("f-1");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Mobile view state: 'folders', 'notes', 'editor'
  const [mobilePane, setMobilePane] = useState<"folders" | "notes" | "editor">(
    "folders",
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "script",
    "indent",
    "size",
    "color",
    "background",
    "font",
    "align",
    "link",
    "image",
    "video",
  ];

  const currentFolderNotes = useMemo(
    () => notes.filter((n) => n.folderId === selectedFolderId),
    [notes, selectedFolderId],
  );

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId),
    [notes, selectedNoteId],
  );

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      setFolders([
        ...folders,
        { id: `f-${Date.now()}`, name: newFolderName.trim() },
      ]);
      setNewFolderName("");
      setIsAddingFolder(false);
    }
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: `n-${Date.now()}`,
      folderId: selectedFolderId,
      title: "Untilted Note",
      content: "",
      tags: [],
      date: new Date().toISOString().split("T")[0],
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setMobilePane("editor");
  };

  const handleUpdateNote = (updates: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotes(
      notes.map((n) => (n.id === selectedNoteId ? { ...n, ...updates } : n)),
    );
  };

  const handleAddTag = () => {
    const tag = prompt("Enter tag name:");
    if (tag && selectedNote) {
      const updatedTags = [...(selectedNote.tags || []), tag.toUpperCase()];
      handleUpdateNote({ tags: updatedTags });
    }
  };

  const selectFolder = (id: string) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null);
    setMobilePane("notes");
  };

  const selectNote = (id: string) => {
    setSelectedNoteId(id);
    setMobilePane("editor");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row h-[calc(100vh-140px)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-sm relative">
      {/* Mobile Header Nav */}
      <div className="flex md:hidden bg-slate-50 border-b border-slate-100 p-2 shrink-0">
        <button
          onClick={() => setMobilePane("folders")}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mobilePane === "folders" ? "bg-white shadow-sm text-[#5e5ce6]" : "text-slate-400"}`}
        >
          Folders
        </button>
        <button
          onClick={() => setMobilePane("notes")}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mobilePane === "notes" ? "bg-white shadow-sm text-[#5e5ce6]" : "text-slate-400"}`}
        >
          Notes
        </button>
        <button
          onClick={() => setMobilePane("editor")}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mobilePane === "editor" ? "bg-white shadow-sm text-[#5e5ce6]" : "text-slate-400"}`}
        >
          Editor
        </button>
      </div>

      {/* Folder Sidebar */}
      <div
        className={`
        ${mobilePane === "folders" ? "flex" : "hidden"} 
        md:flex w-full md:w-64 border-r border-slate-100 bg-slate-50/30 flex-col shrink-0
      `}
      >
        <div className="p-5 border-b border-slate-100">
          {isAddingFolder ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFolder()}
                placeholder="Folder name..."
                className="w-full bg-white border border-[#5e5ce6] rounded-xl px-4 py-2 text-xs font-bold outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddFolder}
                  className="flex-1 bg-[#5e5ce6] text-white text-[10px] font-black uppercase py-1.5 rounded-lg"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingFolder(false)}
                  className="flex-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase py-1.5 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingFolder(true)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add folder
            </button>
          )}
        </div>
        <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">
              Folders
            </div>
            <div className="space-y-1.5">
              {folders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => selectFolder(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${selectedFolderId === f.id ? "bg-white text-[#5e5ce6] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {f.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note List Panel */}
      <div
        className={`
        ${mobilePane === "notes" ? "flex" : "hidden"} 
        md:flex w-full md:w-80 border-r border-slate-100 flex-col shrink-0
      `}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={handleAddNote}
            className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"
          >
            <svg
              className="w-4 h-4 text-[#5e5ce6]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Log Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentFolderNotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full opacity-40">
              <p className="text-sm font-bold text-slate-400">Empty folder</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {currentFolderNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`p-5 cursor-pointer transition-all ${selectedNoteId === note.id ? "bg-[#f5f6ff] border-l-4 border-l-[#5e5ce6]" : "hover:bg-slate-50"}`}
                >
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xs font-black text-slate-800 truncate pr-2">
                      {note.title || "Untitled"}
                    </h4>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">
                      {note.date}
                    </span>
                  </div>
                  <p
                    className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: note.content.slice(0, 100),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Content */}
      <div
        className={`
        ${mobilePane === "editor" ? "flex" : "hidden md:flex"} 
        flex-1 flex flex-col overflow-hidden bg-slate-50/20
      `}
      >
        {selectedNote ? (
          <div className="flex-1 flex flex-col p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleUpdateNote({ title: e.target.value })}
                className="bg-transparent text-xl sm:text-2xl font-black text-slate-800 tracking-tight outline-none w-full"
                placeholder="Title of your note..."
              />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleAddTag}
                  className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-[#5e5ce6] px-4 py-2 rounded-xl shadow-sm"
                >
                  Tag
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete note?")) {
                      setNotes(notes.filter((n) => n.id !== selectedNoteId));
                      setSelectedNoteId(null);
                      setMobilePane("notes");
                    }
                  }}
                  className="bg-rose-50 border border-rose-100 text-[10px] font-black uppercase tracking-widest text-rose-500 px-4 py-2 rounded-xl shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl shadow-indigo-100/10 overflow-hidden">
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ReactQuill
                  value={selectedNote.content}
                  onChange={(content) => handleUpdateNote({ content })}
                  modules={modules}
                  formats={formats}
                  placeholder="Start typing your analysis..."
                  theme="snow"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-8 sm:p-12">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
              Select a note to view its content
            </h3>
            <button
              onClick={handleAddNote}
              className="bg-[#5e5ce6] text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
            >
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookView;
