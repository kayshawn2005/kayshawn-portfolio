/** Fixed top nav — persists across every page and stays visible while scrolling. */
export function TopNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0C0C0C]/80 border-b border-white/10">
      <div className="flex justify-between items-center px-6 md:px-10 py-4 md:py-5 max-w-6xl mx-auto">
        <a href="#/" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-sm md:text-base hover:opacity-70 transition-opacity duration-200">
          Kayshawn Yen
        </a>
        <nav className="flex gap-4 sm:gap-6 md:gap-8">
          <a href="#/about" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200">
            About
          </a>
          <a href="#/gallery" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200">
            Gallery
          </a>
          <a href="#projects" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200">
            Projects
          </a>
          <a href="#/contact" className="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm hover:opacity-70 transition-opacity duration-200">
            Contact
          </a>
        </nav>
      </div>
    </header>
  )
}
