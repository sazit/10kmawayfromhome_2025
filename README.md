# 10km Radius Checker

Simple web app to visualize a 10km radius from any Australian address.

![10km Radius Checker Screenshot](10kmawayfromhome_example.png)

## Background

Originally conceived during COVID-19 lockdowns when travel was restricted to 10km from home. My [2020 attempt](https://github.com/sazit/10kmawayfromhome) took weeks and remained unfinished due to manual research and debugging challenges.

**This complete version was built using Claude AI in under one hour** - demonstrating how AI has revolutionized development speed and accessibility.

## Features

- **Address Search** - Australian addresses with autocomplete
- **10km Visualization** - Green-shaded radius overlay  
- **Dual Map Views** - Satellite and standard options
- **Mobile Responsive** - Touch-friendly interface
- **Instant Results** - Press Enter to select first result

## Usage

1. Type Australian address in search bar
2. Select from dropdown or press Enter
3. View 10km radius on map
4. Toggle satellite/standard views

## Development

**Quick Start**: Open `index.html` in browser (no build required)

**Local Server** (recommended):
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Technical Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Maps**: Leaflet.js + OpenStreetMap/Esri tiles  
- **Geocoding**: Nominatim API (free, no keys required)
- **Deployment**: Any static hosting (Vercel, Netlify, etc.)

## Browser Support
Modern browsers with JavaScript enabled.