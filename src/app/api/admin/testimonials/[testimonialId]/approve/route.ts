// src/app/api/admin/testimonials/[testimonialId]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function PATCH(req: NextRequest, { params }: { params: { testimonialId: string } }) {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }
  const testimonialId = params.testimonialId;
  if (!testimonialId) {
    return NextResponse.json({ message: 'Testimonial ID is required' }, { status: 400 });
  }

  try {
    const { approved } = await req.json();
    if (typeof approved !== 'boolean') {
      return NextResponse.json({ message: 'Invalid "approved" status provided' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update({ approved: approved })
      .eq('id', testimonialId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });

    return NextResponse.json({ message: `Testimonial ${approved ? 'approved' : 'unapproved'} successfully!`, testimonial: data });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update testimonial approval status', error: error.message }, { status: 500 });
  }
}