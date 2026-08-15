import { inter } from './ui/fonts';
import './ui/global.css';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className = {`${inter.className} `}>{children}</body>
    </html>
  );
}