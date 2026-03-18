import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Note } from '@/lib/entities/Note';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(Note);
    const notes = await repo.find({
      order: { updatedAt: 'DESC' },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json(
        { error: 'Title or content is required' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Note);

    const note = repo.create({
      title: title || '',
      content: content || '',
    });

    const saved = await repo.save(note);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
