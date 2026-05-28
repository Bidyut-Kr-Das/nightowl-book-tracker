// import { searchEncyclopedia } from "@/server/book.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, queryType } = await request.json();
    // const res = await searchEncyclopedia(query, queryType);
    return NextResponse.json({ message: "Search successful", data: [] });
  } catch (error) {
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}
