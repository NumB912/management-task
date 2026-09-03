
import { Toaster } from "sonner";
import QueryProvider from "./(front)/providers/query.provider";
import "./globals.css";
import { Roboto } from 'next/font/google'

const font = Roboto({
  subsets: ['vietnamese', 'latin'],
  weight: '400',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <QueryProvider>
         {children}
        </QueryProvider>
          <Toaster visibleToasts={1}/>
      </body>
    </html>
  );
}
