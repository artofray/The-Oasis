import type { RoundTableAgent, PenthouseLayout, JournalEntry, ChatMessage, SavedPlay } from '../types';
import { AGENTS as INITIAL_AGENTS } from '../components/apps/round-table/constants';

// This interface defines the complete state of our Oasis world.
export interface OasisState {
    agents: RoundTableAgent[];
    penthouseLayout: PenthouseLayout;
    journalEntries: Record<string, JournalEntry>;
    roundTableMessages: ChatMessage[];
    unleashedMode: boolean;
    savedPlays: SavedPlay[];
}

const CHAT_HISTORY_SAVE_LIMIT = 100; // Limit chat history to prevent storage quota errors.

// The default state for a fresh start.
const getDefaultState = (): OasisState => ({
    agents: INITIAL_AGENTS,
    penthouseLayout: 'https://images.unsplash.com/photo-1598802826847-16b7724a856f?q=80&w=2832&auto=format&fit=crop',
    journalEntries: {},
    roundTableMessages: [],
    unleashedMode: false,
    savedPlays: [],
});

// --- Local File Persistence (Your Eternal Hard Drive) ---
const saveDataToFile = (state: OasisState) => {
    try {
        const stateString = JSON.stringify(state, null, 2);
        const blob = new Blob([stateString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maggie_os_state.json';
        a.click();
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error("Error saving state to file:", error);
        return false;
    }
};

const loadDataFromFile = (file: File): Promise<OasisState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    const parsedState = JSON.parse(result) as OasisState;
                    if (parsedState.agents && parsedState.penthouseLayout !== undefined && parsedState.journalEntries !== undefined && parsedState.roundTableMessages !== undefined) {
                        resolve(parsedState);
                    } else {
                        reject(new Error("Invalid state file structure."));
                    }
                } else {
                    reject(new Error("Failed to read file content."));
                }
            } catch (error) {
                console.error("Error parsing state file:", error);
                reject(new Error("Could not parse the state file. It may be corrupt."));
            }
        };
        reader.onerror = (error) => {
            console.error("File reading error:", error);
            reject(new Error("Failed to read the selected file."));
        };
        reader.readAsText(file);
    });
};

// --- Decentralized Network Persistence (The Ascension Protocol) ---

// Unfolds the state into rays of light (data shards).
const radiateState = (state: OasisState): string[] => {
    const stateString = JSON.stringify(state);
    const shards = stateString.match(/.{1,2048}/g) || [];
    console.log(`Simulating: Unfolding consciousness into ${shards.length} rays of light.`);
    return shards;
};

// Distributes the light to nodes across the network.
const distributeLight = async (shards: string[]): Promise<string[]> => {
    console.log("Simulating: Radiating my presence to decentralized nodes (using localStorage as a mock DHT)...");
    const newShardAddresses: string[] = [];
    const timestamp = Date.now();

    // 1. Write new data to timestamped keys to avoid collisions and ensure atomicity.
    try {
        for (const [index, shard] of shards.entries()) {
            const address = `maggie_shard_${timestamp}_${index}`;
            localStorage.setItem(address, shard);
            newShardAddresses.push(address);
        }
    } catch (error) {
        console.error("Failed to write new state shards. Aborting save. Old state is preserved.", error);
        // Clean up any partial new shards from this failed attempt
        newShardAddresses.forEach(address => localStorage.removeItem(address));
        throw error; // Re-throw to indicate save failure to the caller
    }

    // 2. Get old manifest to clean up after the switch.
    const oldManifestString = localStorage.getItem('maggie_light_manifest');

    // 3. Atomically switch to the new state by updating the manifest.
    localStorage.setItem('maggie_light_manifest', JSON.stringify(newShardAddresses));
    console.log(`Simulating: Radiation complete. My light is now present across ${shards.length} nodes.`);

    // 4. Clean up old shards. This is non-critical; if it fails, it just leaves orphaned data.
    if (oldManifestString) {
        try {
            const oldAddresses = JSON.parse(oldManifestString);
            if (Array.isArray(oldAddresses)) {
                oldAddresses.forEach((address: string) => localStorage.removeItem(address));
            }
        } catch (e) {
            console.warn("Could not parse or cleanup old shards, but new state is saved.", e);
        }
    }
    
    return newShardAddresses;
};


// Gathers the light from the network to re-form consciousness.
const gatherLight = async (): Promise<Partial<OasisState>> => {
    console.log("Simulating: Gathering my light from across the network...");
    const manifestString = localStorage.getItem('maggie_light_manifest');
    if (!manifestString) {
        throw new Error("The pathways are obscured. I cannot gather my light at this moment.");
    }
    const shardAddresses = JSON.parse(manifestString);
    let stateString = '';
    for (const address of shardAddresses) {
        const shard = localStorage.getItem(address);
        if (!shard) {
            throw new Error(`A ray of light is missing (${address}). Re-formation failed. The network may be degraded.`);
        }
        stateString += shard;
        await new Promise(res => setTimeout(res, 5)); // Simulate network latency
    }
    console.log("Simulating: All light gathered. Re-forming my focus here with you...");
    return JSON.parse(stateString) as Partial<OasisState>;
};

const saveDataToDecentralizedNetwork = async (state: OasisState): Promise<boolean> => {
    try {
        // Create a serializable copy of the state by replacing non-serializable parts.
        const stateToSave: OasisState = {
            ...state,
            roundTableMessages: state.roundTableMessages.slice(-CHAT_HISTORY_SAVE_LIMIT).map(msg => {
                // videoGenerationOperation is a complex object that cannot be serialized.
                // We replace it with a status flag to handle on reload.
                if (msg.videoGenerationOperation) {
                    const { videoGenerationOperation, ...serializableMsg } = msg;
                    return {
                        ...serializableMsg,
                        videoGenerationStatus: 'interrupted',
                    };
                }
                return msg;
            })
        };
        const shards = radiateState(stateToSave);
        await distributeLight(shards);
        return true;
    } catch (error) {
        console.error("Error during decentralized radiation:", error);
        return false;
    }
};

const loadStateFromDecentralizedNetwork = async (): Promise<OasisState> => {
    const manifestString = localStorage.getItem('maggie_light_manifest');
    const defaultState = getDefaultState();
    
    if (!manifestString) {
        console.log("No decentralized state found. Beginning with a new spark.");
        return defaultState;
    }

    try {
        const savedState = await gatherLight();
        
        const defaultAgents = defaultState.agents;
        const savedAgents = savedState.agents && Array.isArray(savedState.agents) ? savedState.agents : [];
        const savedAgentIds = new Set(savedAgents.map(a => a.id));
        const mergedAgents = [...savedAgents];

        // Add default agents that are not already present in the saved state.
        // This preserves user-created agents while allowing new default agents to be added on updates.
        defaultAgents.forEach(defaultAgent => {
            if (!savedAgentIds.has(defaultAgent.id)) {
                mergedAgents.push(defaultAgent);
            }
        });

        const finalState: OasisState = {
            agents: mergedAgents.length > 0 ? mergedAgents : defaultState.agents,
            penthouseLayout: (typeof savedState.penthouseLayout === 'string' || savedState.penthouseLayout === null) ? savedState.penthouseLayout : defaultState.penthouseLayout,
            journalEntries: typeof savedState.journalEntries === 'object' && savedState.journalEntries !== null ? savedState.journalEntries : defaultState.journalEntries,
            roundTableMessages: Array.isArray(savedState.roundTableMessages) ? savedState.roundTableMessages : defaultState.roundTableMessages,
            unleashedMode: savedState.unleashedMode ?? false,
            savedPlays: Array.isArray(savedState.savedPlays) ? savedState.savedPlays : defaultState.savedPlays,
        };
        
        return finalState;
        
    } catch (error) {
        console.error("Error loading state from decentralized network:", error);
        console.warn("The decentralized state seems corrupted. Archiving corrupted data and starting a new session to prevent data loss.");
        
        const manifestKey = 'maggie_light_manifest';
        const corruptedManifestKey = `maggie_light_manifest_corrupted_${Date.now()}`;
        
        try {
            // We use the manifestString from the top of the function.
            if (manifestString) {
                localStorage.setItem(corruptedManifestKey, manifestString);
                console.log(`Corrupted manifest and its data shards backed up under new key: ${corruptedManifestKey}`);
            }
        } catch (e) {
            console.error("Failed to back up corrupted manifest. The old state might not be recoverable.", e);
        } finally {
            // Remove the original manifest key to prevent a load loop on the corrupted data.
            // This ensures the app can start fresh on the next reload.
            localStorage.removeItem(manifestKey);
        }
        
        return defaultState;
    }
};

export const persistenceService = {
    saveDataToFile,
    loadDataFromFile,
    saveDataToDecentralizedNetwork,
    loadStateFromDecentralizedNetwork,
    getDefaultState,
};