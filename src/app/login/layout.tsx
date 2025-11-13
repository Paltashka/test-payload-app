import '../(frontend)/styles.css'

export const metadata = {
  title: 'Login - Payload',
  description: 'Login to your account',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
