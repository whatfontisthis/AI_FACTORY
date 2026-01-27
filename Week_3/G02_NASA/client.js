const API_KEY = '6WeNdslINua1vzFQk9Dydb3Si1C2OEXyz84egrtZ';
const API_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

async function fetchAPOD() {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const errorEl = document.getElementById('error-message');
    const mediaContainer = document.getElementById('media-container');
    const titleEl = document.getElementById('title');
    const dateEl = document.getElementById('date');
    const explanationEl = document.getElementById('explanation');

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update Text
        titleEl.textContent = data.title;
        dateEl.textContent = formatDate(data.date);
        explanationEl.textContent = data.explanation;

        // Handle Media Type
        mediaContainer.innerHTML = '';
        if (data.media_type === 'image') {
            const img = document.createElement('img');
            img.src = data.url;
            img.alt = data.title;
            mediaContainer.appendChild(img);
        } else if (data.media_type === 'video') {
            const iframe = document.createElement('iframe');
            iframe.src = data.url;
            iframe.allowFullscreen = true;
            mediaContainer.appendChild(iframe);
        } else {
            mediaContainer.textContent = 'Unsupported media type: ' + data.media_type;
        }

        // Show Content
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        errorEl.style.display = 'none';

    } catch (error) {
        console.error('Error fetching APOD:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = 'Failed to load NASA Image of the Day. Please try again later.';
        errorEl.style.display = 'block';
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchAPOD);
