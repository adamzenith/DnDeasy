# DnDeasy

**Your intelligent D&D character sheet manager with OCR and auto-population**

DnDeasy is a Progressive Web App (PWA) that revolutionizes how you manage D&D 5th Edition character sheets. Upload PDF character sheets, annotate them, use OCR to extract data, and automatically match spells, items, and feats from the 5e.tools database.

## Features

- 📄 **PDF Viewer & Editor** - View and annotate character sheet PDFs in-browser
- 🔍 **OCR Text Recognition** - Extract text from character sheets using Tesseract.js
- 🎯 **Fuzzy Matching** - Automatically match OCR results to official D&D content
- 📚 **5e.tools Integration** - Access comprehensive D&D 5e data (spells, items, feats, monsters)
- 💾 **Offline-First** - All data cached locally with IndexedDB for offline use
- 🎨 **Annotation Tools** - Draw, highlight, and mark up your character sheets
- ⚡ **Fast & Modern** - Built with React, TypeScript, and Vite

## Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI development
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### PDF & Annotation
- **pdf.js** - Mozilla's PDF renderer for web
- **react-pdf** - React wrapper for pdf.js
- **pdf-lib** - PDF manipulation library
- **Fabric.js** - Canvas-based annotation layer

### Data & Search
- **Dexie.js** - IndexedDB wrapper for local storage
- **Fuse.js** - Fuzzy search for matching OCR results
- **Tesseract.js** - Client-side OCR engine

### Data Source
- **5e.tools** - D&D 5e content from [5etools-mirror-3/5etools-src](https://github.com/5etools-mirror-3/5etools-src)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Project Structure

```
src/
├── components/          # React components
│   ├── annotation/      # Annotation tools and canvas
│   ├── character/       # Character sheet components
│   ├── layout/          # Layout components (nav, etc.)
│   ├── ocr/             # OCR UI components
│   └── pdf/             # PDF viewer components
├── pages/               # Page components (routes)
├── services/            # Business logic and API services
│   ├── database.ts      # IndexedDB operations (Dexie)
│   ├── fiveETools.ts    # 5e.tools data fetching
│   ├── fuzzySearch.ts   # Fuse.js fuzzy matching
│   └── ocr.ts           # Tesseract.js OCR service
├── types/               # TypeScript type definitions
│   ├── character.ts     # Character data types
│   └── dnd.ts           # D&D content types
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── assets/              # Static assets

```

## How It Works

### 1. Upload Character Sheet PDF
Upload your D&D character sheet (PDF format) using the PDF Editor.

### 2. Annotate & Select Regions
Use the annotation tools to:
- Draw boxes around spell names, items, or features
- Highlight important information
- Add notes and markers

### 3. OCR Text Extraction
Select the OCR tool and draw a region around text. The app will:
1. Extract text using Tesseract.js
2. Return the recognized text with confidence score

### 4. Auto-Match Content
The fuzzy search engine will:
1. Take the OCR text (e.g., "firebal" with a typo)
2. Search the cached 5e.tools database
3. Find the best match (e.g., "Fireball" spell)
4. Display the full content details

### 5. Build Character Sheet
Confirm matches to automatically populate your digital character sheet with:
- Complete spell descriptions and mechanics
- Item details and properties
- Feat requirements and benefits
- Monster stat blocks

## Core Services

### Database Service (`services/database.ts`)
Manages local storage using IndexedDB via Dexie.js:
- **Characters** - Character data and metadata
- **Annotations** - PDF annotations and OCR regions
- **Content Cache** - Spells, items, feats, monsters from 5e.tools

### 5e.tools Service (`services/fiveETools.ts`)
Fetches D&D content from the 5e.tools GitHub repository:
- Spells from Player's Handbook
- Items and magic items
- Feats and features
- Monster stat blocks

Content is cached locally for offline use.

### Fuzzy Search Service (`services/fuzzySearch.ts`)
Uses Fuse.js for intelligent matching:
- Handles OCR errors and typos
- Configurable confidence thresholds
- Returns match scores and highlights

### OCR Service (`services/ocr.ts`)
Tesseract.js wrapper for text recognition:
- Client-side processing (no server required)
- Region-based extraction
- Confidence scoring

## Usage Tips

### Best OCR Results
1. Use high-quality, well-lit scans
2. Ensure text is horizontal and legible
3. Draw tight boxes around individual words or short phrases
4. Manual correction is available for low-confidence results

### Content Caching
- First visit: Content loads from 5e.tools GitHub
- Subsequent visits: Instant loading from local cache
- Cache persists across sessions
- Manual refresh available in Content Browser

### Annotation Best Practices
- Use different colors for different types of content
- Label OCR regions before processing
- Export annotations to save your work

## Roadmap

### v1.0 (Current - MVP)
- ✅ Basic PDF viewing
- ✅ 5e.tools data integration
- ✅ OCR text extraction
- ✅ Fuzzy search matching
- 🚧 Full annotation layer with Fabric.js
- 🚧 Character sheet auto-population

### v1.1 (Planned)
- Character sheet CRUD operations
- Export character to JSON/PDF
- Multiple character sheet templates
- Spell slot tracking

### v2.0 (Future)
- Cloud sync (Supabase/Firebase)
- Multi-user campaigns
- Mobile app (React Native)
- Advanced OCR (handwriting support)
- Custom content import

## Legal & Attribution

### 5e.tools Data
This app uses content from [5e.tools](https://5e.tools), which aggregates D&D 5th Edition content for reference purposes. The data is sourced from their [GitHub repository](https://github.com/5etools-mirror-3/5etools-src).

**Important**:
- This app is for **personal use** only
- Do not distribute commercially
- Ensure you own the official D&D books for any content you use
- Respect Wizards of the Coast's intellectual property

### Open Source Licenses
This project uses several open-source libraries. See `package.json` for the full list.

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## Support

For issues or questions, please open an issue on GitHub.

---

**Made with ⚔️ for D&D enthusiasts**
