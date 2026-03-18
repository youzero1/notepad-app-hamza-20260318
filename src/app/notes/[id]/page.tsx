'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/notes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data: Note) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
      })
      .catch(() => setError('Note not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!note) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error();
      const updated: Note = await res.json();
      setNote(updated);
      setDirty(false);
      showToast('Saved!');
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!window.confirm('Delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.push('/');
    } catch {
      showToast('Failed to delete.');
    }
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (error) return <div style={{ padding: 24, color: '#ef4444' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
        >←</button>
        <h1 style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>Edit Note</h1>
        <button
          onClick={handleDelete}
          style={{
            padding: '8px 14px', background: 'transparent', color: '#ef4444',
            border: '1px solid #ef4444', borderRadius: 6, fontWeight: 600, fontSize: 14,
          }}
        >🗑 Delete</button>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            padding: '8px 16px', background: '#4f46e5', color: '#fff',
            border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14,
            opacity: (!dirty || saving) ? 0.6 : 1, cursor: (!dirty || saving) ? 'not-allowed' : 'pointer',
          }}
        >{saving ? 'Saving…' : '💾 Save'}</button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
        placeholder="Title"
        style={{
          width: '100%', padding: '12px 16px', fontSize: 18, fontWeight: 600,
          border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, outline: 'none',
        }}
      />
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setDirty(true); }}
        placeholder="Note content…"
        rows={16}
        style={{
          width: '100%', padding: '12px 16px', fontSize: 15, lineHeight: 1.7,
          border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', resize: 'vertical',
        }}
      />
      {note && (
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          Created: {new Date(note.createdAt).toLocaleString()} &nbsp;·&nbsp;
          Updated: {new Date(note.updatedAt).toLocaleString()}
        </p>
      )}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#1e293b',
          color: '#fff', padding: '10px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
        }}>{toast}</div>
      )}
    </div>
  );
}
