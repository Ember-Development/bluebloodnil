import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout/Layout'
import { FeedPage } from '../pages/FeedPage'
import { AthletesPage } from '../pages/AthletesPage'
import { AthleteProfilePage } from '../pages/AthleteProfilePage'
import { MembersPage } from '../pages/MembersPage'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'
import { LandingPage } from '../pages/LandingPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/athletes/:id" element={<AthleteProfilePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
