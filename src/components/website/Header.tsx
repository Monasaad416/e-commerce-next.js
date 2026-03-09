import MainMenu from "./MainMenu"
import MobileMenu from "./MobileMenu"

export const Header = () => {
  return (
    <header>

      {/* Desktop Menu */}
      <div className="hidden md:flex">
        <MainMenu />
      </div>

      {/* Mobile Menu */}
      <div className="flex md:hidden">
        <MobileMenu />
      </div>

    </header>
  )
}

export default Header

