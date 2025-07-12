import { NextResponse } from 'next/server';

// Auto-detect API URL based on environment
const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

export async function GET() {
  try {
    // This would fetch from your backend API
    const response = await fetch(`${API_BASE}/recipes`);
    const recipes = await response.json();
    
    return new NextResponse(JSON.stringify(recipes, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="recipes.json"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export recipes' },
      { status: 500 }
    );
  }
}