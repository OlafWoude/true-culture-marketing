import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readMediaFile } from "@/lib/cms/media";
import type { Bundle, BundleService } from "@/lib/cms/types";
import { employmentLabel, regionsText } from "@/lib/cms/vacancy";

export const shareImageSize = { width: 1200, height: 630 };

const PHOTO = { width: 430, height: 550 };
const GORILLA = { width: 640, height: 490 };

const dataUri = (type: string, data: Buffer) => `data:${type};base64,${data.toString("base64")}`;

type Assets = { archivo: Buffer; interMedium: Buffer; interBold: Buffer; wordmark: string; gorilla: Buffer };
let assets: Promise<Assets> | null = null;

// Fonts and brand files are read once per server instance.
function loadAssets() {
  // Literal paths, so only these files are bundled with the server code.
  assets ??= Promise.all([
    readFile(path.join(process.cwd(), "lib/og/fonts/archivo-condensed-black.ttf")),
    readFile(path.join(process.cwd(), "lib/og/fonts/inter-medium.ttf")),
    readFile(path.join(process.cwd(), "lib/og/fonts/inter-bold.ttf")),
    readFile(path.join(process.cwd(), "public/brand/wordmark.png")),
    readFile(path.join(process.cwd(), "public/brand/gorilla-mark.png")),
  ])
    .then(([archivo, interMedium, interBold, wordmark, gorilla]) => ({ archivo, interMedium, interBold, wordmark: dataUri("image/png", wordmark), gorilla }))
    .catch((error) => {
      assets = null;
      throw error;
    });
  return assets;
}

function rgb(hex: string) {
  const color = /^#([0-9a-f]{6})$/i.exec(hex)?.[1] ?? "fece00";
  return [0, 2, 4].map((i) => parseInt(color.slice(i, i + 2), 16));
}

/** The white gorilla mark recoloured in the site's accent colour. */
async function tintedGorilla(png: Buffer, hex: string) {
  const [r, g, b] = rgb(hex);
  const { data, info } = await sharp(png).resize(GORILLA.width).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const out = await sharp({ create: { width: info.width, height: info.height, channels: 3, background: { r, g, b } } })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer();
  return dataUri("image/png", out);
}

/** The vacancy's photo, cut to the frame around its focal point. */
async function photoOf(bundle: Bundle, service: BundleService) {
  const media = [service.seo.ogImage, service.image].map((id) => (id ? bundle.media[id] : null)).find((m) => m?.kind === "image");
  if (!media) return null;
  const source = await readMediaFile(media.url);
  if (!source) return null;
  try {
    const meta = await sharp(source).metadata();
    if (!meta.width || !meta.height) return null;
    const scale = Math.max(PHOTO.width / meta.width, PHOTO.height / meta.height);
    const width = Math.ceil(meta.width * scale);
    const height = Math.ceil(meta.height * scale);
    const clamp = (v: number, max: number) => Math.min(Math.max(Math.round(v), 0), max);
    const left = clamp((width * media.focalX) / 100 - PHOTO.width / 2, width - PHOTO.width);
    const top = clamp((height * media.focalY) / 100 - PHOTO.height / 2, height - PHOTO.height);
    const jpeg = await sharp(source)
      .rotate()
      .resize(width, height)
      .extract({ left, top, width: PHOTO.width, height: PHOTO.height })
      .jpeg({ quality: 82 })
      .toBuffer();
    return dataUri("image/jpeg", jpeg);
  } catch {
    return null;
  }
}

/** Share image for a vacancy: its title and key facts in the house style, with its photo when there is one. */
export async function vacancyShareImage(bundle: Bundle, service: BundleService) {
  const [{ archivo, interMedium, interBold, wordmark, gorilla }, photo] = await Promise.all([loadAssets(), photoOf(bundle, service)]);
  const { accent, ink, paper } = bundle.theme.colors;
  const art = photo ?? (await tintedGorilla(gorilla, accent));

  const columnWidth = (photo ? 690 : 720) - 64;
  const title = service.title.toUpperCase();
  // Satori wraps at spaces: the longest word must fit on one line and the whole title on two.
  const longestWord = Math.max(...title.split(/\s+/).map((w) => w.length), 1);
  const titleSize = Math.round(Math.max(56, Math.min(132, columnWidth / (0.52 * longestWord), (columnWidth * 2) / (0.5 * title.length))));
  const eyebrow = ["Vacature", service.tag].filter(Boolean).join(" · ");
  const subtitle = regionsText(service) || service.short;
  const pills = [service.payText, employmentLabel(service.employmentType)].filter(Boolean);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: ink, color: paper, fontFamily: "Inter" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: shareImageSize.width,
            height: shareImageSize.height,
            backgroundImage: `radial-gradient(circle at 12% 0%, rgba(${rgb(accent).join(", ")}, 0.16), rgba(${rgb(accent).join(", ")}, 0) 55%)`,
          }}
        />
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- drawn by the image generator, not shown in a page
          <img src={art} width={PHOTO.width} height={PHOTO.height} alt="" style={{ position: "absolute", top: 40, right: 40, borderRadius: 32 }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- drawn by the image generator, not shown in a page
          <img src={art} width={GORILLA.width} height={GORILLA.height} alt="" style={{ position: "absolute", right: -130, bottom: -50 }} />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: columnWidth + 64,
            height: "100%",
            padding: "56px 0 56px 64px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn by the image generator, not shown in a page */}
          <img src={wordmark} width={150} height={58} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: accent }}>{eyebrow}</div>
            <div style={{ display: "flex", marginTop: 18, fontFamily: "Archivo", fontSize: titleSize, lineHeight: 0.92 }}>{title}</div>
            {subtitle && (
              <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.3, color: "rgba(255, 255, 255, 0.72)" }}>{subtitle}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {pills.map((pill) => (
              <div
                key={pill}
                style={{ display: "flex", padding: "12px 22px", borderRadius: 999, border: "2px solid rgba(255, 255, 255, 0.18)", fontSize: 22, fontWeight: 500 }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [
        { name: "Archivo", data: archivo, weight: 900, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  );
}
