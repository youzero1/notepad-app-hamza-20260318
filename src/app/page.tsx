'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: 'error' } | null>(null);

  const showToast = (msg: string, type?: 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotes(data);
    } catch {
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectNote = (note: Note) => {
    setActiveId(note.id);
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setDirty(false);
  };

  const handleTitleChange = (v: string) => {
    setEditTitle(v);
    setDirty(true);
  };

  const handleContentChange = (v: string) => {
    setEditContent(v);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${activeNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated: Note = await res.json();
      setActiveNote(updated);
      setDirty(false);
      setNotes((prev) =>
        prev
          .map((n) => (n.id === updated.id ? updated : n))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      showToast('Note saved!');
    } catch {
      showToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeNote) return;
    const ok = window.confirm('Delete this note? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/notes/${activeNote.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setNotes((prev) => prev.filter((n) => n.id !== activeNote.id));
      setActiveId(null);
      setActiveNote(null);
      setEditTitle('');
      setEditContent('');
      setDirty(false);
      showToast('Note deleted.');
    } catch {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleNew = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '' }),
      });
      if (!res.ok) throw new Error('Create failed');
      const created: Note = await res.json();
      setNotes((prev) => [created, ...prev]);
      selectNote(created);
      showToast('New note created!');
    } catch {
      showToast('Failed to create note', 'error');
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">📝 Notepad</span>
          <button className="btn-new" onClick={handleNew}>
            + New
          </button>
        </div>
        <div className="sidebar-list">
          {loading ? (
            <div className="empty-sidebar">Loading…</div>
          ) : notes.length === 0 ? (
            <div className="empty-sidebar">
              No notes yet.<br />Click &quot;+ New&quot; to get started.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`note-item${activeId === note.id ? ' active' : ''}`}
                onClick={() => selectNote(note)}
              >
                <div className="note-item-title">
                  {note.title || 'Untitled'}
                </div>
                <div className="note-item-preview">
                  {truncate(note.content, 60) || <em>No content</em>}
                </div>
                <div className="note-item-date">{formatDate(note.updatedAt)}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {activeNote ? (
          <div className="note-editor">
            <div className="editor-toolbar">
              <span className="editor-meta">
                Created {new Date(activeNote.createdAt).toLocaleString()} &nbsp;·&nbsp;
                Updated {new Date(activeNote.updatedAt).toLocaleString()}
              </span>
              <div className="editor-actions">
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  🗑 Delete
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                >
                  {saving ? 'Saving…' : '💾 Save'}
                </button>
              </div>
            </div>
            <div className="editor-card">
              <input
                className="title-input"
                type="text"
                placeholder="Note title…"
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
              <textarea
                className="content-textarea"
                placeholder="Start writing your note here…"
                value={editContent}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="welcome">
            <div className="welcome-icon">📝</div>
            <h2>Welcome to Notepad</h2>
            <p>Select a note from the sidebar, or create a new one to get started.</p>
            <button className="btn btn-primary" onClick={handleNew}>
              + Create your first note
            </button>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast${toast.type === 'error' ? ' error' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
