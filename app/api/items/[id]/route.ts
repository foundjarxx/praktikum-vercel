import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);
    if (!Number.isInteger(itemId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

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

    const item = await prisma.item.update({
      where: { id: itemId },
      data: { name, description: description || null },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update item", error);
    return NextResponse.json(
      { message: "Item gagal diperbarui" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);
    if (!Number.isInteger(itemId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.item.delete({ where: { id: itemId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete item", error);
    return NextResponse.json(
      { message: "Item gagal dihapus" },
      { status: 500 },
    );
  }
}
