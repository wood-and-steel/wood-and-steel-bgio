import React from "react";
import placeholderIcon from "../shared/assets/images/placeholder-icon.svg";
import hamburgerIcon from "../shared/assets/images/hamburger-icon.svg";
import { PopupMenu, PopupMenuItem } from "./PopupMenu";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * Navigation bar component with responsive design. Shows tabs for different views on desktop and mobile,
 * and includes a hamburger menu for game management actions.
 * 
 * @component
 * @param {object} props
 * @param {string} props.input - Search input value (currently unused but kept for compatibility).
 * @param {function} props.setInput - Setter for search input (currently unused but kept for compatibility).
 * @param {boolean} props.startingContractExists - Whether starting contract exists (currently unused but kept for compatibility).
 * @param {'setup'|'play'|'scoring'} props.currentPhase - The current game phase.
 * @param {object} props.G - The game state object.
 * @param {object} props.gameManager - Game manager instance with currentGameCode property.
 * @param {function} props.onNavigateToLobby - Called when user wants to navigate to the lobby.
 * @param {function} props.onOpenEditPlaytest - Called when user wants to open the edit playtest dialog.
 * @param {'board'|'commodities'|'indies'|'cities'} props.activeTab - The currently active tab ID.
 * @param {function} props.onTabChange - Called when a tab is clicked. Receives the tab ID.
 * 
 * @example
 * <NavBar
 *   input={searchInput}
 *   setInput={setSearchInput}
 *   startingContractExists={true}
 *   currentPhase="play"
 *   G={G}
 *   gameManager={gameManager}
 *   onNavigateToLobby={() => navigateToLobby()}
 *   onOpenEditPlaytest={() => openEditDialog()}
 *   activeTab="board"
 *   onTabChange={(tabId) => setActiveTab(tabId)}
 * />
 */
export function NavBar({ input, setInput, startingContractExists, currentPhase, G, gameManager, onNavigateToLobby, onOpenEditPlaytest, activeTab, onTabChange }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef(null);
  const menuButtonDesktopRef = React.useRef(null);
  const isDesktop = useIsDesktop();

  const placement = React.useMemo(
    () => (isDesktop ? { side: "bottom", align: "start" } : { side: "top", align: "end" }),
    [isDesktop]
  );

  const handleCopyGameCode = React.useCallback(async () => {
    if (gameManager?.currentGameCode) {
      try {
        await navigator.clipboard.writeText(gameManager.currentGameCode);
        setIsMenuOpen(false);
      } catch (err) {
        console.error("Failed to copy game code:", err);
      }
    }
  }, [gameManager]);

  const handleMenuClick = React.useCallback(
    (action) => {
      if (action === "lobby") onNavigateToLobby();
      else if (action === "edit") onOpenEditPlaytest();
      setIsMenuOpen(false);
    },
    [onNavigateToLobby, onOpenEditPlaytest]
  );

  const tabs = [
    { id: "board", label: "Contracts" },
    { id: "commodities", label: "Commodities" },
    { id: "indies", label: "Railroads" },
    { id: "cities", label: "Cities" },
  ];

  return (
    <>
      <button
        type="button"
        className="navBar__menuButton"
        ref={menuButtonRef}
        onClick={() => setIsMenuOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
      >
        <img src={hamburgerIcon} alt="" className="navBar__menuIcon" />
      </button>

      <PopupMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={[menuButtonRef, menuButtonDesktopRef]}
        placement={placement}
      >
        <PopupMenuItem onClick={() => handleMenuClick("lobby")}>Go to Lobby</PopupMenuItem>
        {gameManager?.currentGameCode && (
          <PopupMenuItem onClick={handleCopyGameCode}>
            Copy Game Code ({gameManager.currentGameCode})
          </PopupMenuItem>
        )}
        <PopupMenuItem onClick={() => handleMenuClick("edit")}>Add Contract or City...</PopupMenuItem>
      </PopupMenu>

      {/* Main nav bar */}
      <nav className="navBar">
        {/* Desktop: Menu button in left edge */}
        <button
          type="button"
          className="navBar__menuButton--desktop"
          ref={menuButtonDesktopRef}
          onClick={() => setIsMenuOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          <img src={hamburgerIcon} alt="" className="navBar__menuIcon" />
        </button>

        {/* Desktop: Centered tabs with icons */}
        <div className="navBar__tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`navBar__tab ${activeTab === tab.id ? 'navBar__tab--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <img src={placeholderIcon} alt="" className="navBar__tabIcon" />
              <span className="navBar__tabLabel">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile/Tablet: Bottom nav with icons and labels */}
        <div className="navBar__tabs--mobile">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`navBar__tab--mobile ${activeTab === tab.id ? 'navBar__tab--mobile--active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <img src={placeholderIcon} alt="" className="navBar__tabIcon--mobile" />
              <span className="navBar__tabLabel--mobile">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
