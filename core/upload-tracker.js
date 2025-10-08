const fs = require('fs');
const path = require('path');

class UploadTracker {
    constructor (logPath) {
        this.logPath = logPath ? path.resolve(logPath) : path.resolve(process.cwd(), '.upload-log');
        this.uploadedKeys = new Set();
        this._loadExistingEntries();
        this._prepareWriteStream();
    }

    has (key) {
        return this.uploadedKeys.has(key);
    }

    async record (key) {
        if (this.uploadedKeys.has(key)) {
            return;
        }
        this.uploadedKeys.add(key);

        if (!this.writeStream) {
            this._prepareWriteStream();
        }

        await new Promise((resolve, reject) => {
            this.writeStream.write(`${key}\n`, error => {
                if (error) {
                    this.writeStream.destroy();
                    this.writeStream = null;
                    return reject(error);
                }
                resolve();
            });
        });
    }

    getLogPath () {
        return this.logPath;
    }

    async close () {
        if (!this.writeStream) {
            return;
        }

        await new Promise((resolve, reject) => {
            this.writeStream.end(error => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });

        this.writeStream = null;
    }

    _loadExistingEntries () {
        try {
            const existing = fs.readFileSync(this.logPath, 'utf8');
            existing
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean)
                .forEach(line => this.uploadedKeys.add(line));
        } catch (error) {
            if (error.code === 'ENOENT') {
                return;
            }

            console.warn(`Failed to read upload log at ${this.logPath}: ${error.message}`);
        }
    }

    _prepareWriteStream () {
        try {
            const directory = path.dirname(this.logPath);
            fs.mkdirSync(directory, { recursive: true });
        } catch (error) {
            console.warn(`Failed to ensure directory for upload log ${this.logPath}: ${error.message}`);
        }

        this.writeStream = fs.createWriteStream(this.logPath, { flags: 'a' });

        this.writeStream.on('error', error => {
            console.warn(`Upload log stream error for ${this.logPath}: ${error.message}`);
        });
    }
}

module.exports = {
    UploadTracker: UploadTracker
};
