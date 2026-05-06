"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
class Database {
    constructor(baseURL, authKey) {
        this.baseURL = baseURL;
        this.authKey = authKey;
    }
    static getInstance(baseURL, authKey) {
        if (!Database.instance) {
            Database.instance = new Database(baseURL, authKey);
        }
        return Database.instance;
    }
    getData(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.baseURL}/${path}.json?auth=${this.authKey}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data.');
                }
                return response.json();
            }
            catch (error) {
                console.error('Error fetching data:', error);
                return {};
            }
        });
    }
    writeData(path, dataToUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseURL}/${path}.json?auth=${this.authKey}`;
                const response = yield fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToUpdate)
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            }
            catch (error) {
                console.error('Error updating data:', error);
            }
        });
    }
    appendData(path, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const url = `${this.baseURL}/${path}.json?auth=${this.authKey}`;
                const response = yield fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(buffer)
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            }
            catch (error) {
                console.error('Error updating data:', error);
            }
        });
    }
}
exports.Database = Database;
