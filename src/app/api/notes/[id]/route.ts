import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Note } from '@/lib/entities/Note';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Note);
    const note = await repo.findOne({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('GET /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content } = body;

    const ds = await getDataSource();
    const repo = ds.getRepository(Note);
    const note = await repo.findOne({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    note.title = title !== undefined ? title : note.title;
    note.content = content !== undefined ? content : note.content;

    const updated = await repo.save(note);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Note);
    const note = await repo.findOne({ where: { id } });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await repo.remove(note);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
