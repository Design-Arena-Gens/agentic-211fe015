import React from "react";
import Cropper, { Area } from "react-easy-crop";

type Props = {
  imageUrl: string;
  zoom: number;
  setZoom: (z: number) => void;
  crop: { x: number; y: number };
  setCrop: (c: { x: number; y: number }) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
};

export default function FaceCropper({
  imageUrl,
  zoom,
  setZoom,
  crop,
  setCrop,
  onCropComplete
}: Props) {
  // DV head height guidance: 50% - 69% of image height
  // Eye height guidance: 56% - 69% of image height (from bottom)
  const headMin = 0.5;
  const headMax = 0.69;
  const eyeMinFromBottom = 0.56;
  const eyeMaxFromBottom = 0.69;

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }} className="preview">
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        objectFit="contain"
        showGrid={false}
        restrictPosition={true}
      />
      <div className="guides">
        {/* Head height band */}
        <div
          className="guide-line"
          style={{ top: `${(1 - headMax) * 100}%`, borderColor: "rgba(142, 246, 160, 0.6)" }}
        />
        <div
          className="guide-line"
          style={{ top: `${(1 - headMin) * 100}%`, borderColor: "rgba(142, 246, 160, 0.6)" }}
        />
        {/* Eye height band from bottom */}
        <div
          className="guide-line"
          style={{ top: `${(1 - eyeMaxFromBottom) * 100}%`, borderColor: "rgba(93, 211, 255, 0.6)" }}
        />
        <div
          className="guide-line"
          style={{ top: `${(1 - eyeMinFromBottom) * 100}%`, borderColor: "rgba(93, 211, 255, 0.6)" }}
        />
      </div>
      <div
        className="card"
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          padding: "8px 10px",
          fontSize: 12,
          backdropFilter: "blur(4px)"
        }}
      >
        <div className="row">
          <span className="badge" title="Head height guidance">
            Head 50?69%
          </span>
          <span className="badge" title="Eye height from bottom">
            Eyes 56?69%?
          </span>
          <span className="badge">Square 600?600</span>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          Pinch/scroll to zoom. Drag to position.
        </div>
      </div>
      <div style={{ position: "absolute", right: 10, bottom: 10 }}>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{ width: 160 }}
        />
      </div>
    </div>
  );
}

