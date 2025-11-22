/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useCallback, useMemo, useState } from "react";
import FaceCropper from "../components/Cropper";
import { ComplianceChecklist, type Check } from "../components/ComplianceChecklist";
import { bytesToKB, getCroppedImageAsJpeg, readFileAsDataURL } from "../utils/export";
import type { Area } from "react-easy-crop";

type CropPixels = { x: number; y: number; width: number; height: number };

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1.4);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropPixels, setCropPixels] = useState<CropPixels | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; url: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const onSelectFile = async (f: File) => {
    setOutput(null);
    setFile(f);
    const url = await readFileAsDataURL(f);
    setImageUrl(url);
  };

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setCropPixels({
      x: areaPx.x,
      y: areaPx.y,
      width: areaPx.width,
      height: areaPx.height
    });
  }, []);

  const doExport = useCallback(async () => {
    if (!imageUrl || !cropPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageAsJpeg(imageUrl, cropPixels, 600);
      const url = URL.createObjectURL(blob);
      setOutput({ blob, url });
    } finally {
      setSaving(false);
    }
  }, [imageUrl, cropPixels]);

  const checks: Check[] = useMemo(() => {
    const list: Check[] = [];
    // File checks
    if (file) {
      const isJpeg = /jpe?g$/i.test(file.name) || /image\/jpeg/.test(file.type);
      list.push({
        label: isJpeg ? "File format: JPEG" : "File format: not JPEG",
        status: isJpeg ? "ok" : "err",
        hint: "Upload a .jpg or .jpeg file"
      });
      const sizeOk = file.size <= 240 * 1024;
      list.push({
        label: sizeOk ? `Original file ? 240KB (${bytesToKB(file.size)}KB)` : `Original file too large (${bytesToKB(file.size)}KB)`,
        status: sizeOk ? "ok" : "warn",
        hint: "Export step will compress if needed"
      });
    } else {
      list.push({ label: "Upload a photo", status: "warn" });
    }
    // Image checks
    if (natural) {
      const ratio = Math.abs(natural.w / natural.h - 1) < 0.02;
      list.push({
        label: ratio ? "Aspect ratio roughly square" : "Aspect ratio not square",
        status: ratio ? "ok" : "warn",
        hint: "You will crop to exact 1:1"
      });
    }
    // Output checks
    if (output) {
      list.push({
        label: "Export size: 600?600 pixels",
        status: "ok"
      });
      list.push({
        label: output.blob.size <= 240 * 1024 ? `Export ? 240KB (${bytesToKB(output.blob.size)}KB)` : `Export > 240KB (${bytesToKB(output.blob.size)}KB)`,
        status: output.blob.size <= 240 * 1024 ? "ok" : "err",
        hint: output.blob.size > 240 * 1024 ? "Try zooming slightly or increasing background area" : undefined
      });
      list.push({
        label: "Export format: JPEG",
        status: "ok"
      });
    }
    // Manual-only checks
    list.push({
      label: "Plain, light background (no patterns/shadows)",
      status: "warn",
      hint: "Adjust lighting; replace background before upload if needed"
    });
    list.push({
      label: "Neutral expression, no glasses/headwear",
      status: "warn",
      hint: "Religious headwear allowed; face visible"
    });
    list.push({
      label: "Head height 50?69% and eyes 56?69% from bottom",
      status: "warn",
      hint: "Align face within the on-canvas guides"
    });
    return list;
  }, [file, natural, output]);

  const download = useCallback(() => {
    if (!output) return;
    const a = document.createElement("a");
    a.href = output.url;
    a.download = "dv-photo-600x600.jpg";
    a.click();
  }, [output]);

  return (
    <main className="grid">
      <section className="card">
        <div style={{ marginBottom: 12 }}>
          <div className="label">Upload photo (JPEG recommended)</div>
          <div className="uploader" onDragOver={(e) => e.preventDefault()} onDrop={async (e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onSelectFile(f);
          }}>
            <div className="row">
              <input
                className="input"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onSelectFile(f);
                }}
              />
              {file && <span className="badge">{file.name}</span>}
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              Drag & drop supported
            </div>
          </div>
        </div>

        {imageUrl && (
          <>
            <div style={{ marginTop: 12 }}>
              <div className="label">Adjust crop</div>
              <FaceCropper
                imageUrl={imageUrl}
                crop={crop}
                setCrop={setCrop}
                zoom={zoom}
                setZoom={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="button" onClick={doExport} disabled={!cropPixels || saving}>
                {saving ? "Exporting?" : "Export 600?600 JPEG"}
              </button>
              {output && (
                <>
                  <button className="button secondary" onClick={download}>
                    Download
                  </button>
                  <span className="badge">
                    {bytesToKB(output.blob.size)}KB
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </section>

      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div
            className="preview"
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              display: "grid",
              placeItems: "center"
            }}
          >
            {output ? (
              <img
                alt="Export preview"
                src={output.url}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  // final should be 600?600
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : imageUrl ? (
              <img
                alt="Original"
                src={imageUrl}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setNatural({ w: img.naturalWidth, h: img.naturalHeight });
                }}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: 0.85 }}
              />
            ) : (
              <div className="muted">No image yet</div>
            )}
          </div>
        </div>
        <ComplianceChecklist checks={checks} />
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Tips</h3>
          <ul>
            <li>Use a plain white or off?white background with even lighting.</li>
            <li>Face the camera directly with a neutral expression.</li>
            <li>Remove glasses; avoid shadows and obstructing hair.</li>
            <li>Use the guides to fit head height and eye level.</li>
            <li>Export and ensure output is ? 240KB.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

