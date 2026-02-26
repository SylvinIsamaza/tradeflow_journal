"use client"
import React, { useState, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Folder, Note } from "../../types";
import { useNotes, useFolders, useCreateNote, useUpdateNote, useDeleteNote, useCreateFolder, useUpdateFolder, useDeleteFolder } from "@/lib/hooks";
import { useApp } from "@/app/AppContext";

const NotebookView: React.FC = () => {
  const { selectedAccount } = useApp();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  
  const { data: folders = [], isLoading: foldersLoading } = useFolders(selectedAccount?.id);
  const notesResponse = useNotes({
    account_id: selectedAccount?.id,
    folder_id: selectedFolderId || undefined
  });
  const notes = notesResponse.data?.notes || [];
  const isLoading = notesResponse.isLoading;
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const createFolderMutation = useCreateFolder();
  const updateFolderMutation = useUpdateFolder();
  const deleteFolderMutation = useDeleteFolder();

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

  const currentFolderNotes = notes;

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId),
    [notes, selectedNoteId],
  );

  React.useEffect(() => {
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  React.useEffect(() => {
    if (selectedNote) {
      setEditedTitle(selectedNote.title);
      setEditedContent(selectedNote.content);
    }
  }, [selectedNote]);

  const handleAddFolder = () => {
    if (newFolderName.trim() && selectedAccount) {
      createFolderMutation.mutate({
        account_id: selectedAccount.id,
        name: newFolderName.trim(),
      });
      setNewFolderName("");
      setIsAddingFolder(false);
    }
  };

  const handleAddNote = () => {
    if (!selectedFolderId || !selectedAccount) return;
    createNoteMutation.mutate({
      account_id: selectedAccount.id,
      folder_id: selectedFolderId,
      title: "Untitled Note",
      content: "",
      tags: [],
      date: new Date().toISOString().split("T")[0],
    }, {
      onSuccess: (newNote) => {
        setSelectedNoteId(newNote.id);
        setMobilePane("editor");
      }
    });
  };

  const handleUpdateNote = (updates: Partial<Note>) => {
    if (!selectedNoteId) return;
    updateNoteMutation.mutate({ id: selectedNoteId, data: updates });
  };

  const handleSaveNote = () => {
    if (!selectedNoteId) return;
    updateNoteMutation.mutate({ 
      id: selectedNoteId, 
      data: { title: editedTitle, content: editedContent } 
    });
  };

  const handleDeleteNote = () => {
    if (!selectedNoteId) return;
    if (confirm("Delete note?")) {
      deleteNoteMutation.mutate(selectedNoteId);
      setSelectedNoteId(null);
      setMobilePane("notes");
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setDeletingFolderId(folderId);
  };

  const confirmDeleteFolder = () => {
    if (deletingFolderId) {
      deleteFolderMutation.mutate(deletingFolderId);
      if (selectedFolderId === deletingFolderId) {
        setSelectedFolderId(null);
        setSelectedNoteId(null);
      }
      setDeletingFolderId(null);
    }
  };

  const handleEditFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId);
    setEditingFolderName(currentName);
  };

  const handleUpdateFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      updateFolderMutation.mutate({ id: editingFolderId, name: editingFolderName.trim() });
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  if (foldersLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectFolder = (id: string) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null);
    setEditedTitle("");
    setEditedContent("");
    setMobilePane("notes");
  };

  const selectNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setSelectedNoteId(id);
      setEditedTitle(note.title);
      setEditedContent(note.content);
      setMobilePane("editor");
    }
  };

  return (
    <>
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
                   onClick={() => selectFolder(f.id)}
                  key={f.id}
                  className={`group px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${selectedFolderId === f.id ? "bg-white text-[#5e5ce6] shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {editingFolderId === f.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateFolder();
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      onBlur={handleUpdateFolder}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-transparent border-b border-[#5e5ce6] outline-none"
                    />
                  ) : (
                    <span >{f.name}</span>
                  )}
                  <div className="flex gap-1  transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(f.id, f.name);
                      }}
                      className="p-1 hover:bg-indigo-100 rounded text-indigo-500"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(f.id);
                      }}
                      className="p-1 hover:bg-rose-100 rounded text-rose-500"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="bg-transparent text-xl sm:text-2xl font-black text-slate-800 tracking-tight outline-none w-full"
                placeholder="Title of your note..."
              />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleSaveNote}
                  className="bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-600 px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-100"
                >
                  Save
                </button>
                <button
                  onClick={handleDeleteNote}
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
                  key={selectedNote.id}
                  value={editedContent}
                  onChange={setEditedContent}
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

    {/* Delete Confirmation Modal */}
    {deletingFolderId && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <h3 className="text-lg font-black text-slate-800 mb-2">Delete Folder?</h3>
          <p className="text-sm text-slate-600 mb-6">This will permanently delete the folder and all its notes. This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeletingFolderId(null)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFolder}
              className="px-4 py-2 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default NotebookView;
