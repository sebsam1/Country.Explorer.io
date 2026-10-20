
// Using "querySelector()" function because I saw the feedback you gave me last weeks portfolio.

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('#search-input');
const statusEl = document.querySelector('#status');
const resultsContainerEl = document.querySelector('#results-container');

const flagEl = document.querySelector('#country-flag');
const nameEl = document.querySelector('#country-name');
const capitalEl = document.querySelector('#country-capital');
const regionEl = document.querySelector('#country-region');
const populationEl = document.querySelector('#country-population');
const areaEl = document.querySelector('#country-area');
const languagesEl = document.querySelector('#country-languages');
const currenciesEl = document.querySelector('#country-currencies');

let map = null;

const showStatus = (message, kind) => {
    statusEl.innerHTML = `<div class="alert alert-${kind}">${message}</div>`;
};

const clearResults = () => {
    resultsContainerEl.classList.add('d-none');
    if (map) {
        map.remove();
        map = null;
    }
};

const searchCountry = async (name) => {
    statusEl.innerHTML = '';
    
    const trimmedName = name.trim();
    if (!trimmedName) {
        showStatus('Please enter a country name.', 'warning');
        return;
    }

    try {
        showStatus(`Searching for "${trimmedName}"...`, 'info');
        
        const url = `https://countries.dev/name/${encodeURIComponent(trimmedName)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const country = Array.isArray(data) ? data[0] : (data.data || data);
        // This syntax for ? and : is from C++ which i am mainly coding for my hobby and "?" is short for if, ":" is short for else.
        
        if (!country) {
            throw new Error(`No matching country found for "${trimmedName}".`);
        }

        resultsContainerEl.classList.remove('d-none');

        displayCountry(country);
        statusEl.innerHTML = '';

    } catch (error) {
        resultsContainerEl.classList.add('d-none');
        showStatus(`Could not load country details: ${error.message}`, 'danger');
    }
};

const displayCountry = (country) => {
    nameEl.textContent = country.name || 'N/A';
    capitalEl.textContent = country.capital || 'N/A';
    regionEl.textContent = country.region || 'N/A';
    populationEl.textContent = country.population ? Number(country.population).toLocaleString() : 'N/A';
    areaEl.textContent = country.area ? `${Number(country.area).toLocaleString()} km²` : 'N/A';

    if (country.languages && Array.isArray(country.languages)) {
        languagesEl.textContent = country.languages.map(l => l.name || l).join(', ');
    } else {
        languagesEl.textContent = 'N/A';
    }

    if (country.currencies && Array.isArray(country.currencies)) {
        currenciesEl.textContent = country.currencies.map(c => `${c.name} (${c.symbol || c.code})`).join(', ');
    } else {
        currenciesEl.textContent = 'N/A';
    }

    if (country.flag && country.flag.svg) {
        flagEl.src = country.flag.svg;
        flagEl.alt = `Flag of ${country.name}`;
    } else if (country.flags && country.flags.svg) {
        flagEl.src = country.flags.svg;
        flagEl.alt = `Flag of ${country.name}`;
    }

    const lat = country.latlng ? country.latlng[0] : 0;
    const lng = country.latlng ? country.latlng[1] : 0;

    if (map) {
        map.remove();
    }

    map = L.map('map').setView([lat, lng], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${country.name}</b>`)
        .openPopup();

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
};

formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    searchCountry(inputEl.value);
});