const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE_FILE = '.fileignore';

class LocalFileReader {
    constructor (folderToRead, options = {}) {
        this.folderToRead = path.resolve(folderToRead);
        this.ignoreRules = this._loadIgnoreRules(options.ignoreConfigPath);
    }

    async readFile (filePath) {
        try {
            return await fs.promises.readFile(filePath);
        } catch (error) {
            console.error(`Failed to read ${filePath}: ${error.message}`);
            throw error;
        }
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

    _loadIgnoreRules (ignoreConfigPath) {
        const configPath = ignoreConfigPath
            ? path.resolve(ignoreConfigPath)
            : path.resolve(process.cwd(), DEFAULT_IGNORE_FILE);

        let patterns = [];
        try {
            const fileContent = fs.readFileSync(configPath, 'utf8');
            patterns = fileContent
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`Failed to read ignore file at ${configPath}: ${error.message}`);
            }
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

        const normalizedPath = relativePath.split(path.sep).join('/');

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
