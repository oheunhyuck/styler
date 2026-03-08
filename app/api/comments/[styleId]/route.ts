import { supabase } from '@/lib/supabase';

export async function GET(_: Request, { params }: { params: { styleId: string } }) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, author, content, created_at')
    .eq('style_id', params.styleId)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request, { params }: { params: { styleId: string } }) {
  const { author, content } = await req.json();

  if (!author?.trim() || !content?.trim())
    return Response.json({ error: '닉네임과 내용을 입력해주세요.' }, { status: 400 });

  const { data, error } = await supabase
    .from('comments')
    .insert({ style_id: params.styleId, author: author.trim(), content: content.trim() })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
