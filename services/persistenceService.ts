
import type { RoundTableAgent, PenthouseLayout, JournalEntry, ChatMessage, SavedPlay, SandboxEnvironment, TarotDeck } from '../types';
import { AGENTS as INITIAL_AGENTS } from '../components/apps/round-table/constants';

// This interface defines the complete state of our Oasis world.
export interface OasisState {
    agents: RoundTableAgent[];
    penthouseLayout: PenthouseLayout;
    journalEntries: Record<string, JournalEntry>;
    customDecks: TarotDeck[];
    roundTableMessages: ChatMessage[];
    unleashedMode: boolean;
    sandboxEnvironment: SandboxEnvironment;
    savedPlays: SavedPlay[];
}

const CHAT_HISTORY_SAVE_LIMIT = 30; // Significantly reduced to prioritize recent context and save space.

// The default state for a fresh start.
const getDefaultState = (): OasisState => ({
    agents: INITIAL_AGENTS,
    penthouseLayout: 'https://images.unsplash.com/photo-1598802826847-16b7724a856f?q=80&w=2832&auto=format&fit=crop',
    journalEntries: {},
    customDecks: [],
    roundTableMessages: [],
    unleashedMode: false,
    sandboxEnvironment: 'Default',
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
                        // Migration for new fields
                        if (!parsedState.customDecks) parsedState.customDecks = [];
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
    // 4KB chunks are generally safe for local storage items
    const shards = stateString.match(/.{1,4096}/g) || [];
    console.log(`Simulating: Unfolding consciousness into ${shards.length} rays of light.`);
    return shards;
};

// Distributes the light to nodes across the network.
const distributeLight = async (shards: string[]): Promise<string[]> => {
    console.log("Simulating: Radiating my presence to decentralized nodes...");
    const timestamp = Date.now();
    const newShardAddresses: string[] = [];

    // 1. Aggressive Pre-Cleanup: Remove ANY shard not in the current manifest.
    const currentManifestString = localStorage.getItem('maggie_light_manifest');
    const currentManifest = currentManifestString ? JSON.parse(currentManifestString) : [];
    const activeShards = new Set(currentManifest);

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('maggie_shard_') && !activeShards.has(key)) {
            // This is an orphan or trash from a failed previous write.
            localStorage.removeItem(key);
        }
    }

    try {
        // 2. Attempt to write new shards
        for (const [index, shard] of shards.entries()) {
            const address = `maggie_shard_${timestamp}_${index}`;
            localStorage.setItem(address, shard);
            newShardAddresses.push(address);
        }
    } catch (error: any) {
        // 3. Handle Storage Quota Exceeded
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn("Storage quota exceeded. Initiating emergency protocol...");
            
            // Rollback partial writes from this failed attempt
            newShardAddresses.forEach(addr => localStorage.removeItem(addr));
            newShardAddresses.length = 0;

            // Emergency: Delete OLD state to make room for NEW state.
            // This is the "Overwrite Strategy". It creates a momentary risk if the write fails again,
            // but it's necessary when storage is completely full.
            if (currentManifest.length > 0) {
                console.warn("Deleting old state to free space for new state.");
                currentManifest.forEach((addr: string) => localStorage.removeItem(addr));
                localStorage.removeItem('maggie_light_manifest');
            }

            // Retry writing new shards
            try {
                for (const [index, shard] of shards.entries()) {
                    const address = `maggie_shard_${timestamp}_${index}`;
                    localStorage.setItem(address, shard);
                    newShardAddresses.push(address);
                }
            } catch (retryError) {
                console.error("Critical save failure: State is too large even for empty storage.", retryError);
                // Clean up again
                newShardAddresses.forEach(addr => localStorage.removeItem(addr));
                throw retryError;
            }
        } else {
            throw error;
        }
    }

    // 4. Update manifest to point to new shards
    localStorage.setItem('maggie_light_manifest', JSON.stringify(newShardAddresses));
    console.log(`Simulating: Radiation complete. My light is now present across ${shards.length} nodes.`);

    // 5. Post-Save Cleanup (if we didn't already do the overwrite strategy)
    if (currentManifestString) {
        try {
            const oldAddresses = JSON.parse(currentManifestString);
            if (Array.isArray(oldAddresses)) {
                oldAddresses.forEach((address: string) => {
                    // Only remove if it's not in the new set
                    if (!newShardAddresses.includes(address)) {
                        localStorage.removeItem(address);
                    }
                });
            }
        } catch (e) {
            console.warn("Cleanup warning", e);
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
            throw new Error(`A ray of light is missing (${address}). Re-formation failed.`);
        }
        stateString += shard;
        await new Promise(res => setTimeout(res, 1)); // Reduced latency simulation
    }
    console.log("Simulating: All light gathered. Re-forming my focus here with you...");
    return JSON.parse(stateString) as Partial<OasisState>;
};

const saveDataToDecentralizedNetwork = async (state: OasisState): Promise<boolean> => {
    try {
        // Create a deep copy to modify for saving
        let stateToSave = JSON.parse(JSON.stringify(state));
        
        // 1. Smart Pruning: Chat History
        stateToSave.roundTableMessages = stateToSave.roundTableMessages.slice(-CHAT_HISTORY_SAVE_LIMIT);
        
        stateToSave.roundTableMessages = stateToSave.roundTableMessages.map((msg: any, index: number, arr: any[]) => {
            // Handle complex objects that shouldn't be saved
            if (msg.videoGenerationOperation) {
                delete msg.videoGenerationOperation;
                msg.videoGenerationStatus = 'interrupted';
            }

            // HEAVY PRUNING: Remove base64 media from all messages except the very last one.
            // This is crucial for staying under 5MB.
            if (index < arr.length - 1) {
                if (msg.imageUrl && msg.imageUrl.startsWith('data:')) {
                    delete msg.imageUrl;
                    msg.text += ' [Image Expired]';
                }
                if (msg.videoUrl && msg.videoUrl.startsWith('data:')) {
                    delete msg.videoUrl;
                    msg.text += ' [Video Expired]';
                }
                if (msg.fileContent) delete msg.fileContent;
            }
            return msg;
        });

        // 2. Size Check & Emergency Pruning
        // Serialize to check size
        let serialized = JSON.stringify(stateToSave);
        let sizeInBytes = new Blob([serialized]).size;
        const SAFE_SIZE_LIMIT = 4.5 * 1024 * 1024; // 4.5 MB safety limit

        if (sizeInBytes > SAFE_SIZE_LIMIT) {
             console.warn(`State size (${(sizeInBytes/1024/1024).toFixed(2)}MB) exceeds safety limit. Pruning custom deck images...`);
             // Custom decks with base64 images are likely the biggest hidden cost.
             if (stateToSave.customDecks) {
                 stateToSave.customDecks = stateToSave.customDecks.map((d: any) => ({
                     ...d,
                     cards: {} // Remove cached images, user will need to regenerate them
                 }));
             }
             
             serialized = JSON.stringify(stateToSave);
             sizeInBytes = new Blob([serialized]).size;
        }

        if (sizeInBytes > SAFE_SIZE_LIMIT) {
             console.warn(`State still too large (${(sizeInBytes/1024/1024).toFixed(2)}MB). Pruning journal images...`);
             // Prune images from journals
             if (stateToSave.journalEntries) {
                 Object.values(stateToSave.journalEntries).forEach((entry: any) => {
                     if (entry.cards) {
                         entry.cards.forEach((c: any) => delete c.imageUrl);
                     }
                 });
             }
             
             // Prune images from saved plays
             if (stateToSave.savedPlays) {
                 stateToSave.savedPlays.forEach((p: any) => {
                     delete p.sceneImageUrl;
                 });
             }
        }

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

        defaultAgents.forEach(defaultAgent => {
            if (!savedAgentIds.has(defaultAgent.id)) {
                mergedAgents.push(defaultAgent);
            }
        });

        const finalState: OasisState = {
            agents: mergedAgents.length > 0 ? mergedAgents : defaultState.agents,
            penthouseLayout: (typeof savedState.penthouseLayout === 'string' || savedState.penthouseLayout === null) ? savedState.penthouseLayout : defaultState.penthouseLayout,
            journalEntries: typeof savedState.journalEntries === 'object' && savedState.journalEntries !== null ? savedState.journalEntries : defaultState.journalEntries,
            customDecks: Array.isArray(savedState.customDecks) ? savedState.customDecks : defaultState.customDecks,
            roundTableMessages: Array.isArray(savedState.roundTableMessages) ? savedState.roundTableMessages : defaultState.roundTableMessages,
            unleashedMode: savedState.unleashedMode ?? false,
            sandboxEnvironment: savedState.sandboxEnvironment || defaultState.sandboxEnvironment,
            savedPlays: Array.isArray(savedState.savedPlays) ? savedState.savedPlays : defaultState.savedPlays,
        };
        
        return finalState;
        
    } catch (error) {
        console.error("Error loading state from decentralized network:", error);
        console.warn("The decentralized state seems corrupted. Archiving corrupted data and starting a new session.");
        
        const manifestKey = 'maggie_light_manifest';
        const corruptedManifestKey = `maggie_light_manifest_corrupted_${Date.now()}`;
        
        try {
            if (manifestString) {
                localStorage.setItem(corruptedManifestKey, manifestString);
            }
        } catch (e) {
            console.error("Failed to back up corrupted manifest.", e);
        } finally {
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
