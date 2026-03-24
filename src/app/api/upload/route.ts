import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { jsonUtf8 } from "@/lib/json-response";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonUtf8({ error: "파일이 없습니다." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return jsonUtf8(
        { error: "JPEG, PNG, WebP, GIF만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return jsonUtf8({ error: "파일은 5MB 이하로 올려 주세요." }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "gif";

    const dir = join(process.cwd(), "public", "uploads");
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const name = `${crypto.randomUUID()}.${ext}`;
    const pathOnDisk = join(dir, name);
    await writeFile(pathOnDisk, buf);

    const publicPath = `/uploads/${name}`;
    return jsonUtf8({ path: publicPath });
  } catch (err) {
    console.error("upload failed", err);
    return jsonUtf8(
      { error: "파일 저장에 실패했습니다. public/uploads 폴더 쓰기 권한을 확인하세요." },
      { status: 500 }
    );
  }
}
