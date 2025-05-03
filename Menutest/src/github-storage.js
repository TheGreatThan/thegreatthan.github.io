/**
 * GitHub Gist Storage Module for Quan340
 * This module handles saving and loading data using GitHub Gists API
 */

class GitHubStorage {
    constructor(options = {}) {
        this.token = options.token || ''; // GitHub personal access token
        this.username = options.username || ''; // GitHub username
        this.configured = false;
    }

    /**
     * Configure the GitHub storage with credentials
     * @param {Object} options - Configuration options
     */
    configure(options) {
        this.token = options.token || '';
        this.username = options.username || '';
        
        // Save token to localStorage for persistence
        if (this.token && this.username) {
            localStorage.setItem('github_token', this.token);
            localStorage.setItem('github_username', this.username);
            this.configured = true;
        }
        
        return this.configured;
    }

    /**
     * Load configuration from localStorage if available
     */
    loadConfig() {
        this.token = localStorage.getItem('github_token') || '';
        this.username = localStorage.getItem('github_username') || '';
        this.configured = !!(this.token && this.username);
        return this.configured;
    }

    /**
     * Check if storage is configured
     */
    isConfigured() {
        return this.configured;
    }

    /**
     * Create a new Gist with the specified content
     * @param {String} filename - Name of the file to create
     * @param {Object} content - Content to save (will be stringified to JSON)
     * @param {String} description - Description of the Gist
     * @param {Boolean} isPublic - Whether the Gist should be public
     * @returns {Promise} - Promise resolving to created Gist data
     */
    async createGist(filename, content, description = 'Quan340 Data', isPublic = false) {
        if (!this.configured) {
            throw new Error('GitHub storage not configured. Please set token and username first.');
        }

        const files = {};
        files[filename] = {
            content: JSON.stringify(content, null, 2)
        };

        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: description,
                public: isPublic,
                files: files
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create Gist: ${response.status} ${errorData.message}`);
        }

        return response.json();
    }

    /**
     * Update an existing Gist
     * @param {String} gistId - ID of the Gist to update
     * @param {String} filename - Name of the file to update
     * @param {Object} content - Content to save (will be stringified to JSON)
     * @returns {Promise} - Promise resolving to updated Gist data
     */
    async updateGist(gistId, filename, content) {
        if (!this.configured) {
            throw new Error('GitHub storage not configured. Please set token and username first.');
        }

        const files = {};
        files[filename] = {
            content: JSON.stringify(content, null, 2)
        };

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: files
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to update Gist: ${response.status} ${errorData.message}`);
        }

        return response.json();
    }

    /**
     * Get a list of all Gists for the configured user
     * @returns {Promise} - Promise resolving to an array of Gists
     */
    async listGists() {
        if (!this.configured) {
            throw new Error('GitHub storage not configured. Please set token and username first.');
        }

        const response = await fetch(`https://api.github.com/users/${this.username}/gists`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to list Gists: ${response.status} ${errorData.message}`);
        }

        return response.json();
    }

    /**
     * Get a specific Gist by ID
     * @param {String} gistId - ID of the Gist to get
     * @returns {Promise} - Promise resolving to Gist data
     */
    async getGist(gistId) {
        if (!this.configured) {
            throw new Error('GitHub storage not configured. Please set token and username first.');
        }

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get Gist: ${response.status} ${errorData.message}`);
        }

        return response.json();
    }

    /**
     * Delete a Gist
     * @param {String} gistId - ID of the Gist to delete
     * @returns {Promise} - Promise resolving when deletion is complete
     */
    async deleteGist(gistId) {
        if (!this.configured) {
            throw new Error('GitHub storage not configured. Please set token and username first.');
        }

        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status !== 204) { // 204 means success with no content
                const errorData = await response.json();
                throw new Error(`Failed to delete Gist: ${response.status} ${errorData.message}`);
            }
        }

        return { success: true };
    }

    /**
     * Get the content of a file from a Gist
     * @param {String} gistId - ID of the Gist
     * @param {String} filename - Name of the file to read
     * @returns {Promise} - Promise resolving to parsed JSON content
     */
    async getGistContent(gistId, filename) {
        const gist = await this.getGist(gistId);
        
        if (!gist.files || !gist.files[filename]) {
            throw new Error(`File ${filename} not found in Gist ${gistId}`);
        }
        
        const content = gist.files[filename].content;
        try {
            return JSON.parse(content);
        } catch (error) {
            console.error('Error parsing Gist content:', error);
            return content; // Return raw content if parsing fails
        }
    }

    /**
     * Find a Gist by filename
     * @param {String} filename - Name of the file to find
     * @returns {Promise} - Promise resolving to Gist ID or null if not found
     */
    async findGistByFilename(filename) {
        const gists = await this.listGists();
        
        for (const gist of gists) {
            if (gist.files && gist.files[filename]) {
                return gist.id;
            }
        }
        
        return null;
    }

    /**
     * Save data to a Gist, creating or updating as needed
     * @param {String} filename - Name of the file to save
     * @param {Object} content - Content to save
     * @param {String} description - Description for new Gists
     * @returns {Promise} - Promise resolving to saved Gist data
     */
    async saveData(filename, content, description = 'Quan340 Data') {
        try {
            // Try to find an existing Gist with this filename
            const existingGistId = await this.findGistByFilename(filename);
            
            if (existingGistId) {
                // Update existing Gist
                return await this.updateGist(existingGistId, filename, content);
            } else {
                // Create new Gist
                return await this.createGist(filename, content, description);
            }
        } catch (error) {
            console.error('Error saving data to Gist:', error);
            throw error;
        }
    }

    /**
     * Load data from a Gist by filename
     * @param {String} filename - Name of the file to load
     * @returns {Promise} - Promise resolving to parsed content or null if not found
     */
    async loadData(filename) {
        try {
            const gistId = await this.findGistByFilename(filename);
            
            if (!gistId) {
                console.warn(`No Gist found with filename: ${filename}`);
                return null;
            }
            
            return await this.getGistContent(gistId, filename);
        } catch (error) {
            console.error('Error loading data from Gist:', error);
            throw error;
        }
    }

    /**
     * List all files stored in Gists
     * @returns {Promise} - Promise resolving to an array of file objects with metadata
     */
    async listFiles() {
        try {
            const gists = await this.listGists();
            const files = [];
            
            for (const gist of gists) {
                const gistId = gist.id;
                const created = new Date(gist.created_at);
                const updated = new Date(gist.updated_at);
                
                for (const filename in gist.files) {
                    files.push({
                        name: filename,
                        gistId: gistId,
                        size: gist.files[filename].size,
                        created: created,
                        updated: updated,
                        description: gist.description || ''
                    });
                }
            }
            
            // Sort by updated date (newest first)
            files.sort((a, b) => b.updated - a.updated);
            
            return files;
        } catch (error) {
            console.error('Error listing files from Gists:', error);
            throw error;
        }
    }
}

// Export as global variable
window.gitHubStorage = new GitHubStorage(); 