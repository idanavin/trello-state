import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { BoardPage } from './pages/BoardPage'
import { ComparePage } from './pages/ComparePage'
import { WsProvider } from './ws/WsProvider'
import './index.css'

export function App() {
  return (
    <WsProvider>
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Trello State</h1>
          <nav className="app-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              Single
            </NavLink>
            <NavLink to="/compare" className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
              Compare
            </NavLink>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<BoardPage />} />
            <Route path="/compare" element={<ComparePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </WsProvider>
  )
}
