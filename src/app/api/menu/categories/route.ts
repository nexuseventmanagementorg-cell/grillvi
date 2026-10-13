import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = getCategories();
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, displayOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newCategory = createCategory({
      name,
      slug: generatedSlug,
      description: description || '',
      displayOrder: Number(displayOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (err) {
    console.error('Error creating category:', err);
    return NextResponse.json({ error: 'Failed to create category.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const updated = updateCategory(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    console.error('Error updating category:', err);
    return NextResponse.json({ error: 'Failed to update category.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const deleted = deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    return NextResponse.json({ error: 'Failed to delete category.' }, { status: 500 });
  }
}
