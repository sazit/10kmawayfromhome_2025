// Global variables
let map;
let currentCircle = null;
let currentMarker = null;
let searchTimeout = null;
let selectedIndex = -1;

// Map layer configurations
const mapLayers = {
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 18
    }),
    standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 19
    })
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
});

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
    // Default to Sydney center  
    map = L.map('map', {
        attributionControl: false
    }).setView([-33.8688, 151.2093], 10);
    
    // Add default standard layer
    mapLayers.standard.addTo(map);
    
    // Remove default zoom control and add custom position
    map.zoomControl.setPosition('bottomright');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const addressInput = document.getElementById('addressInput');
    const searchResults = document.getElementById('searchResults');
    const satelliteBtn = document.getElementById('satelliteBtn');
    const standardBtn = document.getElementById('standardBtn');
    const searchButton = document.getElementById('searchButton');
    const closeResults = document.getElementById('closeResults');
    
    if (!addressInput || !searchButton || !searchResults) {
        console.error('Required elements not found!');
        return;
    }
    
    // Address input events
    addressInput.addEventListener('input', handleAddressInput);
    addressInput.addEventListener('keydown', handleKeyNavigation);
    
    // Search button event
    searchButton.addEventListener('click', handleSearchButton);
    
    // Close results button
    closeResults.addEventListener('click', hideSearchResults);
    
    // Map type toggle events
    satelliteBtn.addEventListener('click', () => switchMapType('satellite'));
    standardBtn.addEventListener('click', () => switchMapType('standard'));
    
    // Click outside to close search results
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container') && !e.target.closest('#searchResults')) {
            hideSearchResults();
        }
    });
    
    console.log('All event listeners added');
}

/**
 * Handle address input with debouncing
 */
function handleAddressInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (query.length < 3) {
        hideSearchResults();
        return;
    }
    
    // Debounce search requests
    searchTimeout = setTimeout(() => {
        searchAddresses(query);
    }, 500);
}

/**
 * Handle search button click
 */
function handleSearchButton() {
    const query = document.getElementById('addressInput').value.trim();
    
    if (query.length < 2) {
        alert('Please enter an address to search for.');
        return;
    }
    
    searchAddresses(query);
}

/**
 * Handle keyboard navigation in search results
 */
function handleKeyNavigation(e) {
    const resultsList = document.getElementById('resultsList');
    const items = resultsList.querySelectorAll('.result-item');
    
    if (items.length === 0) return;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateHighlight(items);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateHighlight(items);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0) {
                selectAddress(items[selectedIndex]);
            } else if (items.length > 0) {
                // If no item selected but results exist, select first one
                selectAddress(items[0]);
            } else {
                // If no results, trigger search
                handleSearchButton();
            }
            break;
            
        case 'Escape':
            hideSearchResults();
            e.target.blur();
            break;
    }
}

/**
 * Update result item highlighting
 */
function updateHighlight(items) {
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
}

/**
 * Search for Australian addresses using Nominatim
 */
async function searchAddresses(query) {
    try {
        showLoading();
        
        // Enhanced query formatting for better street address results
        let searchQuery = query.trim();
        
        // If it looks like a street address (contains numbers), improve formatting
        const hasNumbers = /\d/.test(searchQuery);
        const hasStreetKeywords = /\b(st|street|rd|road|ave|avenue|dr|drive|ln|lane|pl|place|ct|court|way|crescent|cres)\b/i.test(searchQuery);
        
        if (hasNumbers && hasStreetKeywords) {
            // Street address - be more specific
            if (!searchQuery.toLowerCase().includes('australia')) {
                searchQuery = `${searchQuery}, Australia`;
            }
        } else {
            // Suburb/city - add Australia if not present
            if (!searchQuery.toLowerCase().includes('australia')) {
                searchQuery = `${searchQuery}, Australia`;
            }
        }
        
        // Try multiple search strategies for better results
        const searchUrls = [
            // Primary search - exact match
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(searchQuery)}&` +
            `countrycodes=au&` +
            `format=json&` +
            `limit=8&` +
            `addressdetails=1&` +
            `extratags=1&` +
            `dedupe=1`,
            
            // Fallback search - structured query for street addresses
            ...(hasNumbers && hasStreetKeywords ? [
                `https://nominatim.openstreetmap.org/search?` +
                `street=${encodeURIComponent(searchQuery.split(',')[0])}&` +
                `country=Australia&` +
                `countrycodes=au&` +
                `format=json&` +
                `limit=5&` +
                `addressdetails=1`
            ] : [])
        ];
        
        let allResults = [];
        
        // Try primary search first
        const response = await fetch(searchUrls[0]);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const results = await response.json();
        allResults = results;
        
        // If we got few results and have a fallback, try that too
        if (allResults.length < 3 && searchUrls.length > 1) {
            try {
                const fallbackResponse = await fetch(searchUrls[1]);
                if (fallbackResponse.ok) {
                    const fallbackResults = await fallbackResponse.json();
                    // Merge results, avoiding duplicates
                    fallbackResults.forEach(result => {
                        if (!allResults.find(r => r.place_id === result.place_id)) {
                            allResults.push(result);
                        }
                    });
                }
            } catch (fallbackError) {
                console.log('Fallback search failed:', fallbackError);
            }
        }
        
        hideLoading();
        displaySearchResults(allResults);
        
    } catch (error) {
        console.error('Search error:', error);
        hideLoading();
        showError(`Search failed: ${error.message}. Please try again.`);
    }
}

/**
 * Display search results in dropdown
 */
function displaySearchResults(results) {
    const resultsList = document.getElementById('resultsList');
    
    if (results.length === 0) {
        resultsList.innerHTML = '<div class="no-results">No addresses found</div>';
        showSearchResults();
        return;
    }
    
    const html = results.map((result, index) => {
        const address = formatAddress(result);
        return `
            <div class="result-item" data-lat="${result.lat}" data-lon="${result.lon}" data-address="${address.main}">
                <div class="result-main">${address.main}</div>
                <div class="result-sub">${address.sub}</div>
            </div>
        `;
    }).join('');
    
    resultsList.innerHTML = html;
    
    // Add click listeners to result items
    resultsList.querySelectorAll('.result-item').forEach((item, index) => {
        item.addEventListener('click', (e) => {
            selectAddress(item);
        });
        
        item.addEventListener('mouseenter', () => {
            // Remove previous selection
            resultsList.querySelectorAll('.result-item').forEach(i => i.classList.remove('selected'));
            // Add selection to current item
            item.classList.add('selected');
        });
    });
    
    showSearchResults();
}

/**
 * Format address from Nominatim result
 */
function formatAddress(result) {
    const addr = result.address || {};
    
    // Build main address line with priority for street addresses
    let main = '';
    let sub = [];
    
    // Priority 1: Full street address
    if (addr.house_number && addr.road) {
        main = `${addr.house_number} ${addr.road}`;
        // Add suburb/locality to sub
        if (addr.suburb) sub.push(addr.suburb);
        else if (addr.locality) sub.push(addr.locality);
        else if (addr.town) sub.push(addr.town);
        else if (addr.city) sub.push(addr.city);
    }
    // Priority 2: Just the road/street
    else if (addr.road) {
        main = addr.road;
        if (addr.suburb) sub.push(addr.suburb);
        else if (addr.locality) sub.push(addr.locality);
        else if (addr.town) sub.push(addr.town);
        else if (addr.city) sub.push(addr.city);
    }
    // Priority 3: Suburb/locality/town
    else if (addr.suburb) {
        main = addr.suburb;
        if (addr.city && addr.city !== addr.suburb) sub.push(addr.city);
    }
    else if (addr.locality) {
        main = addr.locality;
        if (addr.city && addr.city !== addr.locality) sub.push(addr.city);
    }
    else if (addr.town) {
        main = addr.town;
        if (addr.city && addr.city !== addr.town) sub.push(addr.city);
    }
    else if (addr.city) {
        main = addr.city;
    }
    // Fallback: use display name
    else {
        const parts = result.display_name.split(',');
        main = parts[0].trim();
        if (parts.length > 1) {
            sub.push(parts[1].trim());
        }
    }
    
    // Always add state and postcode to sub if available
    if (addr.state) {
        // Only add state if not already in sub
        const stateAbbrev = addr.state.replace('New South Wales', 'NSW')
                                    .replace('Victoria', 'VIC')
                                    .replace('Queensland', 'QLD')
                                    .replace('Western Australia', 'WA')
                                    .replace('South Australia', 'SA')
                                    .replace('Tasmania', 'TAS')
                                    .replace('Northern Territory', 'NT')
                                    .replace('Australian Capital Territory', 'ACT');
        if (!sub.some(s => s.includes(stateAbbrev) || s.includes(addr.state))) {
            sub.push(stateAbbrev);
        }
    }
    if (addr.postcode) {
        sub.push(addr.postcode);
    }
    
    return {
        main: main,
        sub: sub.join(', ')
    };
}

/**
 * Select an address and show radius
 */
function selectAddress(item) {
    const lat = parseFloat(item.dataset.lat);
    const lon = parseFloat(item.dataset.lon);
    const address = item.dataset.address;
    
    // Update input value
    document.getElementById('addressInput').value = address;
    
    // Hide search results panel
    hideSearchResults();
    
    // Show location on map
    showLocationWithRadius(lat, lon, address);
}

/**
 * Show selected location with 10km radius
 */
function showLocationWithRadius(lat, lon, address) {
    // Remove existing marker and circle
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    if (currentCircle) {
        map.removeLayer(currentCircle);
    }
    
    // Add marker
    currentMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<strong>${address}</strong><br>10km radius from this location`)
        .openPopup();
    
    // Add 10km radius circle (10000 meters)
    currentCircle = L.circle([lat, lon], {
        radius: 10000,
        className: 'radius-circle',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        color: '#059669',
        weight: 2,
        opacity: 0.7,
        dashArray: '8, 4'
    }).addTo(map);
    
    // Fit map to show the circle with some padding
    const bounds = currentCircle.getBounds();
    map.fitBounds(bounds, { padding: [50, 50] });
}

/**
 * Switch between map types
 */
function switchMapType(type) {
    const satelliteBtn = document.getElementById('satelliteBtn');
    const standardBtn = document.getElementById('standardBtn');
    
    // Remove current layer
    map.eachLayer((layer) => {
        if (layer === mapLayers.satellite || layer === mapLayers.standard) {
            map.removeLayer(layer);
        }
    });
    
    // Add new layer
    mapLayers[type].addTo(map);
    
    // Update button states
    if (type === 'satellite') {
        satelliteBtn.classList.add('active');
        standardBtn.classList.remove('active');
    } else {
        standardBtn.classList.add('active');
        satelliteBtn.classList.remove('active');
    }
}

/**
 * Show search results panel
 */
function showSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.remove('hidden');
}

/**
 * Hide search results panel
 */
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.add('hidden');
}

/**
 * Show loading indicator
 */
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    // Simple alert for now - could be enhanced with a custom modal
    alert(message);
}

// Initialize the app
console.log('10km Radius Checker - Ready!');

