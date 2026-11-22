import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cat Clapping",
  description: "A four-panel manga meme about loving the ordinary.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
