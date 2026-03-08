import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UploadStylePayload } from '@/lib/types';

export async function GET() {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  let body: UploadStylePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, description, css, author } = body;

  if (!name?.trim() || !css?.trim() || !author?.trim()) {
    return NextResponse.json({ error: '이름, 작성자, CSS는 필수입니다.' }, { status: 400 });
  }
  if (css.length > 100_000) {
    return NextResponse.json({ error: 'CSS는 100KB를 초과할 수 없습니다.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('styles')
    .insert({
      name: name.trim().slice(0, 60),
      description: description?.trim().slice(0, 200) ?? '',
      css: css.trim(),
      author: author.trim().slice(0, 30),
      likes: 0,
      views: 0,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
