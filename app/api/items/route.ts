import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch items", error);
    return NextResponse.json(
      { message: "Database tidak dapat diakses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Nama item wajib diisi" },
        { status: 400 },
      );
    }

    const item = await prisma.item.create({
      data: { name, description: description || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create item", error);
    return NextResponse.json(
      { message: "Item gagal ditambahkan" },
      { status: 500 },
    );
  }
}
