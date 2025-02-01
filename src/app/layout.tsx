import './globals.css' // your global Tailwind or CSS file
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  // Choose whichever weights you need
  weight: ['400', '600', '700'],
  // The subsets you need, e.g. Latin
  subsets: ['latin'],
  // Optional: define a custom variable name to use in CSS
  variable: '--font-poppins'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  )
}
