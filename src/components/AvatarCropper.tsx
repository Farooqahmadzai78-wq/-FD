import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

const BOX = 260; // on-screen crop viewport size (px)
const CROP_R = 118; // crop circle radius (px), 236px diameter inside 260px box
const CROP_SIZE = CROP_R * 2; // crop circle size (px)
const OUT = 512; // exported square size (px)

/**
 * WhatsApp-style circular cropper: the picture keeps its aspect ratio,
 * the user pans and zooms to choose the visible disc before validating.
 */
export function AvatarCropper({
  file,
  open,
  onCancel,
  onCropped,
}: {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const { t } = useI18n();
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return setImg(null);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Scale that makes the picture cover the circular crop box at zoom = 1.
  const base = img ? Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height) : 1;
  const scale = base * zoom;
  const w = img ? img.width * scale : 0;
  const h = img ? img.height * scale : 0;

  const clamp = useCallback(
    (p: { x: number; y: number }) => {
      const maxX = Math.max(0, (w - CROP_SIZE) / 2);
      const maxY = Math.max(0, (h - CROP_SIZE) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, p.x)),
        y: Math.min(maxY, Math.max(-maxY, p.y)),
      };
    },
    [w, h],
  );

  useEffect(() => setPos((p) => clamp(p)), [clamp]);

  const start = (x: number, y: number) => {
    drag.current = { x, y, ox: pos.x, oy: pos.y };
  };
  const move = (x: number, y: number) => {
    const d = drag.current;
    if (!d) return;
    setPos(clamp({ x: d.ox + (x - d.x), y: d.oy + (y - d.y) }));
  };
  const end = () => {
    drag.current = null;
  };

  const confirm = () => {
    if (!img) return;
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setBusy(false);

    const k = OUT / CROP_SIZE;
    ctx.save();
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, (OUT - w * k) / 2 + pos.x * k, (OUT - h * k) / 2 + pos.y * k, w * k, h * k);
    ctx.restore();
    canvas.toBlob(
      (blob) => {
        setBusy(false);
        if (blob) onCropped(blob);
      },
      "image/png",
      0.95,
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.cropPhotoTitle}</DialogTitle>
        </DialogHeader>

        <div
          className="relative mx-auto touch-none overflow-hidden rounded-3xl bg-white select-none shadow-sm"
          style={{ width: BOX, height: BOX }}
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            start(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => move(e.clientX, e.clientY)}
          onPointerUp={end}
          onPointerCancel={end}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width: w,
                height: h,
                left: BOX / 2 - w / 2 + pos.x,
                top: BOX / 2 - h / 2 + pos.y,
              }}
            />
          )}

          {/* Solid white overlay mask with centered circular cutout & soft drop shadow */}
          <svg
            className="pointer-events-none absolute inset-0 size-full z-10"
            viewBox={`0 0 ${BOX} ${BOX}`}
          >
            <defs>
              <mask id="avatar-crop-mask">
                <rect x="0" y="0" width={BOX} height={BOX} fill="white" />
                <circle cx={BOX / 2} cy={BOX / 2} r={CROP_R} fill="black" />
              </mask>
              <filter id="crop-circle-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="6"
                  floodColor="#000000"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>
            <rect
              x="0"
              y="0"
              width={BOX}
              height={BOX}
              fill="white"
              mask="url(#avatar-crop-mask)"
              filter="url(#crop-circle-shadow)"
            />
            <circle
              cx={BOX / 2}
              cy={BOX / 2}
              r={CROP_R}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1.5"
            />
          </svg>

          <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
            Preview
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">{t.cropHint}</p>
        <Slider
          value={[zoom]}
          min={1}
          max={4}
          step={0.01}
          onValueChange={([v]) => setZoom(v)}
          aria-label="zoom"
        />

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="soft" onClick={onCancel}>
            {t.cancel}
          </Button>
          <Button variant="widget" disabled={!img || busy} onClick={confirm}>
            {t.validate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
