import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CharacterSheetPage from './pages/CharacterSheetPage'
import PDFEditorPage from './pages/PDFEditorPage'
import ContentBrowserPage from './pages/ContentBrowserPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="character/:id" element={<CharacterSheetPage />} />
          <Route path="pdf-editor" element={<PDFEditorPage />} />
          <Route path="content" element={<ContentBrowserPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
