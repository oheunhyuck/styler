import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase.rpc('increment_views', { style_id: params.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
