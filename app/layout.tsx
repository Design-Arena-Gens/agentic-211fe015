export const metadata = {
  title: "DV Lottery Photo Tool",
  description: "Create a compliant 600x600 DV Lottery photo in your browser."
};

import "./globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header style={{ marginBottom: 18 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="badge">DV Lottery</div>
                <h1 className="title">Photo Tool</h1>
                <p className="subtitle">
                  Upload, align, and export a compliant 600?600 JPEG ? 240KB.
                </p>
              </div>
              <a
                href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html"
                target="_blank"
                rel="noreferrer"
                className="badge"
              >
                Official Photo Requirements
              </a>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

