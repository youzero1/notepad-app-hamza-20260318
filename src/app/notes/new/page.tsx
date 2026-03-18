'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim() && !content.trim()) {
      setError('Please add a title or content.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error('Failed to create');
      router.push('/');
      router.refresh();
    } catch {
      setError('Failed to create note. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ marginBottom: 20, fontSize: 24, fontWeight: 700 }}>New Note</h1>
      {error && (
        <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>{error}</div>
      )}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', fontSize: 18, fontWeight: 600,
          border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, outline: 'none',
        }}
      />
      <textarea
        placeholder="Start writing…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={14}
        style={{
          width: '100%', padding: '12px 16px', fontSize: 15, lineHeight: 1.7,
          border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={handleCreate}
          disabled={saving}
          style={{
            padding: '10px 22px', background: '#4f46e5', color: '#fff',
            border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >
          {saving ? 'Creating…' : 'Create Note'}
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 22px', background: '#e2e8f0', color: '#1e293b',
            border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
