/**
 * PokeAPI Client
 * A JavaScript client for interacting with the PokeAPI (https://pokeapi.co/)
 */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generic fetch wrapper with caching and error handling
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - API response data
 */
async function fetchFromAPI(endpoint) {
    const url = endpoint.startsWith('http') ? endpoint : `${POKEAPI_BASE_URL}${endpoint}`;
    
    // Check cache
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Store in cache
        cache.set(url, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        throw error;
    }
}

/**
 * Clear the cache
 */
function clearCache() {
    cache.clear();
}

// ============================================
// Pokemon Endpoints
// ============================================

/**
 * Get a Pokemon by name or ID
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object>} - Pokemon data
 */
async function getPokemon(nameOrId) {
    return fetchFromAPI(`/pokemon/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get a list of Pokemon with pagination
 * @param {number} limit - Number of Pokemon to fetch (default: 20)
 * @param {number} offset - Starting position (default: 0)
 * @returns {Promise<Object>} - List of Pokemon with count and navigation
 */
async function getPokemonList(limit = 20, offset = 0) {
    return fetchFromAPI(`/pokemon?limit=${limit}&offset=${offset}`);
}

/**
 * Get Pokemon species information (includes evolution chain, flavor text, etc.)
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object>} - Pokemon species data
 */
async function getPokemonSpecies(nameOrId) {
    return fetchFromAPI(`/pokemon-species/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get detailed Pokemon data including species info
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object>} - Combined Pokemon and species data
 */
async function getPokemonDetailed(nameOrId) {
    const [pokemon, species] = await Promise.all([
        getPokemon(nameOrId),
        getPokemonSpecies(nameOrId)
    ]);
    
    return {
        ...pokemon,
        species_data: species
    };
}

// ============================================
// Type Endpoints
// ============================================

/**
 * Get a Pokemon type by name or ID
 * @param {string|number} nameOrId - Type name or ID
 * @returns {Promise<Object>} - Type data with damage relations
 */
async function getType(nameOrId) {
    return fetchFromAPI(`/type/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get all Pokemon types
 * @returns {Promise<Object>} - List of all types
 */
async function getAllTypes() {
    return fetchFromAPI('/type');
}

// ============================================
// Ability Endpoints
// ============================================

/**
 * Get an ability by name or ID
 * @param {string|number} nameOrId - Ability name or ID
 * @returns {Promise<Object>} - Ability data
 */
async function getAbility(nameOrId) {
    return fetchFromAPI(`/ability/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get a list of abilities with pagination
 * @param {number} limit - Number of abilities to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of abilities
 */
async function getAbilityList(limit = 20, offset = 0) {
    return fetchFromAPI(`/ability?limit=${limit}&offset=${offset}`);
}

// ============================================
// Move Endpoints
// ============================================

/**
 * Get a move by name or ID
 * @param {string|number} nameOrId - Move name or ID
 * @returns {Promise<Object>} - Move data
 */
async function getMove(nameOrId) {
    return fetchFromAPI(`/move/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get a list of moves with pagination
 * @param {number} limit - Number of moves to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of moves
 */
async function getMoveList(limit = 20, offset = 0) {
    return fetchFromAPI(`/move?limit=${limit}&offset=${offset}`);
}

// ============================================
// Item Endpoints
// ============================================

/**
 * Get an item by name or ID
 * @param {string|number} nameOrId - Item name or ID
 * @returns {Promise<Object>} - Item data
 */
async function getItem(nameOrId) {
    return fetchFromAPI(`/item/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get a list of items with pagination
 * @param {number} limit - Number of items to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of items
 */
async function getItemList(limit = 20, offset = 0) {
    return fetchFromAPI(`/item?limit=${limit}&offset=${offset}`);
}

// ============================================
// Location Endpoints
// ============================================

/**
 * Get a location by name or ID
 * @param {string|number} nameOrId - Location name or ID
 * @returns {Promise<Object>} - Location data
 */
async function getLocation(nameOrId) {
    return fetchFromAPI(`/location/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get a list of locations with pagination
 * @param {number} limit - Number of locations to fetch
 * @param {number} offset - Starting position
 * @returns {Promise<Object>} - List of locations
 */
async function getLocationList(limit = 20, offset = 0) {
    return fetchFromAPI(`/location?limit=${limit}&offset=${offset}`);
}

/**
 * Get a location area by name or ID
 * @param {string|number} nameOrId - Location area name or ID
 * @returns {Promise<Object>} - Location area data with Pokemon encounters
 */
async function getLocationArea(nameOrId) {
    return fetchFromAPI(`/location-area/${nameOrId.toString().toLowerCase()}`);
}

// ============================================
// Evolution Endpoints
// ============================================

/**
 * Get an evolution chain by ID
 * @param {number} id - Evolution chain ID
 * @returns {Promise<Object>} - Evolution chain data
 */
async function getEvolutionChain(id) {
    return fetchFromAPI(`/evolution-chain/${id}`);
}

/**
 * Get evolution chain for a specific Pokemon
 * @param {string|number} nameOrId - Pokemon name or ID
 * @returns {Promise<Object>} - Evolution chain data
 */
async function getPokemonEvolutionChain(nameOrId) {
    const species = await getPokemonSpecies(nameOrId);
    const evolutionChainUrl = species.evolution_chain.url;
    return fetchFromAPI(evolutionChainUrl);
}

// ============================================
// Generation & Region Endpoints
// ============================================

/**
 * Get a generation by name or ID
 * @param {string|number} nameOrId - Generation name or ID (e.g., 1, "generation-i")
 * @returns {Promise<Object>} - Generation data
 */
async function getGeneration(nameOrId) {
    return fetchFromAPI(`/generation/${nameOrId.toString().toLowerCase()}`);
}

/**
 * Get all generations
 * @returns {Promise<Object>} - List of all generations
 */
async function getAllGenerations() {
    return fetchFromAPI('/generation');
}

/**
 * Get a region by name or ID
 * @param {string|number} nameOrId - Region name or ID
 * @returns {Promise<Object>} - Region data
 */
async function getRegion(nameOrId) {
    return fetchFromAPI(`/region/${nameOrId.toString().toLowerCase()}`);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get Pokemon sprite URL
 * @param {number} id - Pokemon ID
 * @param {Object} options - Sprite options
 * @param {boolean} options.shiny - Get shiny sprite
 * @param {boolean} options.female - Get female sprite
 * @param {boolean} options.back - Get back sprite
 * @returns {string} - Sprite URL
 */
function getSpriteUrl(id, { shiny = false, female = false, back = false } = {}) {
    const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
    let path = '';
    
    if (back) path += '/back';
    if (shiny) path += '/shiny';
    if (female) path += '/female';
    
    return `${baseUrl}${path}/${id}.png`;
}

/**
 * Get official artwork URL
 * @param {number} id - Pokemon ID
 * @param {boolean} shiny - Get shiny artwork
 * @returns {string} - Artwork URL
 */
function getOfficialArtworkUrl(id, shiny = false) {
    const variant = shiny ? 'shiny' : '';
    const path = shiny ? `other/official-artwork/shiny/${id}.png` : `other/official-artwork/${id}.png`;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${path}`;
}

/**
 * Search Pokemon by name (partial match)
 * @param {string} query - Search query
 * @param {number} limit - Max results to return
 * @returns {Promise<Array>} - Matching Pokemon
 */
async function searchPokemon(query, limit = 10) {
    const allPokemon = await getPokemonList(1500, 0); // Get all Pokemon names
    const queryLower = query.toLowerCase();
    
    const matches = allPokemon.results
        .filter(pokemon => pokemon.name.includes(queryLower))
        .slice(0, limit);
    
    return matches;
}

/**
 * Get multiple Pokemon by IDs (batch fetch)
 * @param {Array<string|number>} ids - Array of Pokemon names or IDs
 * @returns {Promise<Array>} - Array of Pokemon data
 */
async function getPokemonBatch(ids) {
    return Promise.all(ids.map(id => getPokemon(id)));
}

/**
 * Format Pokemon name for display (capitalize, handle special cases)
 * @param {string} name - Pokemon name from API
 * @returns {string} - Formatted name
 */
function formatPokemonName(name) {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get type color for styling
 * @param {string} typeName - Type name
 * @returns {string} - Hex color code
 */
function getTypeColor(typeName) {
    const typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };
    
    return typeColors[typeName.toLowerCase()] || '#68A090';
}

// ============================================
// Export API Client
// ============================================

const PokeAPIClient = {
    // Pokemon
    getPokemon,
    getPokemonList,
    getPokemonSpecies,
    getPokemonDetailed,
    getPokemonBatch,
    searchPokemon,
    
    // Types
    getType,
    getAllTypes,
    
    // Abilities
    getAbility,
    getAbilityList,
    
    // Moves
    getMove,
    getMoveList,
    
    // Items
    getItem,
    getItemList,
    
    // Locations
    getLocation,
    getLocationList,
    getLocationArea,
    
    // Evolution
    getEvolutionChain,
    getPokemonEvolutionChain,
    
    // Generations & Regions
    getGeneration,
    getAllGenerations,
    getRegion,
    
    // Utilities
    getSpriteUrl,
    getOfficialArtworkUrl,
    formatPokemonName,
    getTypeColor,
    clearCache,
    
    // Constants
    BASE_URL: POKEAPI_BASE_URL
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PokeAPIClient;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
    window.PokeAPIClient = PokeAPIClient;
}
