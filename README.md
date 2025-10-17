# 10km Radius Checker

A web application for visualizing a 10km radius from any Australian address.

![10km Radius Checker Screenshot](screenshot.png)

*Search for any Australian address and see exactly what areas are within a 10km radius - perfect for understanding travel restrictions or delivery zones.*

## Background

During the COVID-19 lockdowns in 2020, travel restrictions limited movement to within 10km of home. At the time, I wanted to create a simple website where anyone could paste their address and see exactly what that 10km radius looked like on a map. There was no ChatGPT, no AI assistance, and everything had to be built from scratch through manual research, trial and error, and countless hours of documentation reading.

I managed to create a semi-working prototype using Leaflet.js, but it never gained traction. The development process was slow, debugging was tedious, and implementing features like address autocomplete required extensive API research and integration work.

Fast forward to 2024, and the landscape has fundamentally changed. What once took weeks of research, experimentation, and debugging can now be accomplished in a single conversation. Modern AI assistance transforms the development process from a slow, iterative struggle into rapid prototyping and immediate problem-solving. The same application that remained unfinished years ago was recreated in minutes, complete with professional styling, mobile responsiveness, and robust functionality.

This project serves as a tangible example of how AI has revolutionized software development speed and accessibility, making complex implementations achievable for developers of all skill levels.

## Features

**Address Search**: Type-ahead search with autocomplete for Australian addresses at both suburb and house level granularity.

**10km Radius Visualization**: Accurate circular overlay showing the exact 10km boundary from any selected location.

**Dual Map Views**: Toggle between satellite and standard map tiles, both optimized for clean, minimal presentation.

**Mobile Responsive**: Touch-friendly interface designed for mobile-first usage with bottom-positioned search bar.

**Clean Interface**: Professional blue-themed design without unnecessary visual clutter.

## Local Development

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your web browser
3. No build process required

### Running with Local Server (Recommended)
For better performance and to avoid potential CORS issues:

**Option 1: Using Python**
```bash
python3 -m http.server 8000
```

**Option 2: Using Node.js**
```bash
npm install -g http-server
http-server -p 8000
```

**Option 3: Using PHP**
```bash
php -S localhost:8000
```

Then open: http://localhost:8000

### File Structure
```
10kmawayfromhome_2025/
├── index.html      Main HTML structure
├── style.css       Styling with blue theme
├── script.js       JavaScript functionality
└── README.md       This file
```

## Usage

1. Type an Australian address in the search bar at the bottom of the screen
2. Select from the autocomplete dropdown suggestions
3. View your location with a 10km radius circle overlay
4. Toggle between satellite and standard map views using the controls

## Deployment

### Static Hosting Services
The application can be deployed to any static hosting service by uploading all files:

**Vercel or Netlify**: Drag and drop the entire folder to deploy instantly.

**Verse Cell**: Upload the files and configure as a static website.

## Technical Details

**Frontend**: Built with vanilla HTML, CSS, and JavaScript without external frameworks.

**Mapping**: Leaflet.js library with OpenStreetMap and Esri satellite tile layers.

**Geocoding**: Nominatim API provides free Australian address geocoding services.

**Styling**: CSS Grid and Flexbox layout with custom blue color theme.

**Responsive Design**: Mobile-first approach with touch-friendly interface elements.

## Browser Support
Modern browsers including Chrome, Firefox, Safari, and Edge. Mobile browsers including iOS Safari and Chrome Mobile. JavaScript must be enabled.

## Performance
The application loads quickly with minimal dependencies. Map tiles are cached by the browser for improved performance on subsequent visits. The Nominatim API provides reliable geocoding without requiring API keys or rate limiting for reasonable usage.