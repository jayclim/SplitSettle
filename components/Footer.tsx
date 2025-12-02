export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto flex h-14 items-center justify-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>© 2025 Divvy. All rights reserved.</span>
          <span className="hidden md:inline">|</span>
          <span>
            designed and developed by{' '}
            <a href="https://jaydenclim.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#B31B1B' }}>
              Jayden Lim
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}