import "./globals.scss";
import Logo from "./logo";

export const metadata = {
  title: "Melody Mapper",
  description: "Find artists related to all your favourites."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Logo />
        {children}
      </body>
    </html>
  );
}
