const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE_FILE = '.fileignore';
const PATH_SEPARATOR_REGEX = /[\\/]+/g;

class LocalFileReader {
    constructor (folderToRead, options = {}) {
        this.folderToRead = path.resolve(folderToRead);
        this.ignoreRules = this._initializeIgnoreRules(options);
    }

    readFile (filePath) {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath);

            const handleError = (error) => {
                console.error(`Failed to read ${filePath}: ${error.message}`);
                stream.destroy();
                reject(error);
            };

            stream.once('error', handleError);
            stream.once('open', () => {
                stream.off('error', handleError);
                stream.on('error', (error) => {
                    console.error(`Stream error for ${filePath}: ${error.message}`);
                });
                resolve(stream);
            });
        });
    }

    getFiles (dir, files = []) {
        // Start the recursivity by the folder to archive
        if (!dir) {
            dir = this.folderToRead;
        }

        let fileList;
        try {
            fileList = fs.readdirSync(dir, { withFileTypes: true });
        } catch (error) {
            if (error.code === 'EPERM' || error.code === 'EACCES') {
                // Skip directories that the process cannot read due to permissions.
                console.warn(`Skipping directory ${dir}: ${error.message}`);
                return files;
            }
            throw error;
        }

        for (const entry of fileList) {
          const name = path.join(dir, entry.name);
          const relativePath = path.relative(this.folderToRead, name) || entry.name;
          const isDirectory = entry.isDirectory();

          if (this._shouldIgnore(relativePath, isDirectory)) {
            continue;
          }

          if (isDirectory) {
            this.getFiles(name, files);
          } else {
            files.push(name);
          }
        }
        return files;
    }

    getBasePath () {
        return this.folderToRead;
    }

    _initializeIgnoreRules (options) {
        const candidatePaths = [];

        if (options.ignoreConfigPath) {
            candidatePaths.push(path.resolve(options.ignoreConfigPath));
        }

        candidatePaths.push(path.join(this.folderToRead, DEFAULT_IGNORE_FILE));
        candidatePaths.push(path.resolve(process.cwd(), DEFAULT_IGNORE_FILE));

        const compiled = [];
        const seen = new Set();

        for (const configPath of candidatePaths) {
            if (seen.has(configPath)) {
                continue;
            }
            seen.add(configPath);
            compiled.push(...this._loadIgnoreRules(configPath));
        }

        return compiled;
    }

    _loadIgnoreRules (configPath) {
        if (!configPath) {
            return [];
        }

        let patterns = [];
        try {
            const fileContent = fs.readFileSync(configPath, 'utf8');
            patterns = fileContent
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            if (error.code === 'EISDIR') {
                console.warn(`${configPath} is a directory. Skipping ignore configuration.`);
                return [];
            }
            console.warn(`Failed to read ignore file at ${configPath}: ${error.message}`);
            return [];
        }

        return patterns.map(pattern => this._compilePattern(pattern));
    }

    _compilePattern (pattern) {
        let directoryOnly = false;
        let anchored = false;
        let rawPattern = pattern;

        if (rawPattern.endsWith('/')) {
            directoryOnly = true;
            rawPattern = rawPattern.slice(0, -1);
        }

        if (rawPattern.startsWith('/')) {
            anchored = true;
            rawPattern = rawPattern.slice(1);
        }

        const escaped = rawPattern.replace(/([.+^=!:${}()|[\]\\])/g, '\\$1');
        const placeholder = '__DOUBLE_STAR__';
        let regexBody = escaped
            .replace(/\*\*/g, placeholder)
            .replace(/\*/g, '[^/]*')
            .replace(new RegExp(placeholder, 'g'), '.*')
            .replace(/\?/g, '[^/]');

        if (anchored) {
            regexBody = `^${regexBody}(?:$|/)`;
        } else {
            regexBody = `(?:^|\\/)${regexBody}(?:$|/)`;
        }

        const regex = new RegExp(regexBody);

        return { regex, directoryOnly };
    }

    _shouldIgnore (relativePath, isDirectory) {
        if (!relativePath) {
            return false;
        }

        const normalizedPath = relativePath.replace(PATH_SEPARATOR_REGEX, '/');

        return this.ignoreRules.some(rule => {
            if (rule.directoryOnly && !isDirectory) {
                return false;
            }
            return rule.regex.test(normalizedPath);
        });
    }
}

module.exports = {
    LocalFileReader: LocalFileReader
}
