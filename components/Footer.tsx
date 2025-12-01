export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container flex h-14 items-center justify-between">
        <p className="mx-6 text-sm text-muted-foreground">
          © copyright 2025 | designed and developed by{' '}
          <a href="https://jaydenclim.com" target="_blank" rel="noopener noreferrer" style={{ color: '#B31B1B' }}>
            Jayden Lim
          </a>
        </p>
      </div>
    </footer>
  )
}