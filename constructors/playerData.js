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
exports.Player = void 0;
const database_1 = require("./datastore/database");
class Player {
    constructor(userId) {
        this.userId = userId;
        this.db = database_1.Database.getInstance("", "");
    }
    getWarrants() {
        return __awaiter(this, void 0, void 0, function* () {
            let warrants = {};
            try {
                warrants = yield this.db.getData(`/Warrants/${this.userId}`);
            }
            catch (e) {
                warrants = false;
            }
            return warrants;
        });
    }
    getArrests() {
        return __awaiter(this, void 0, void 0, function* () {
            let arrests = {};
            try {
                arrests = yield this.db.getData(`/Arrests/${this.userId}`);
            }
            catch (e) {
                arrests = false;
            }
            return arrests;
        });
    }
    saveWarrant(id, buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            let completed = false;
            try {
                yield this.db.writeData(`/Warrants/${this.userId}/${id}`, buffer);
                completed = true;
            }
            catch (e) { }
            return completed;
        });
    }
    editWarrant(id, state) {
        return __awaiter(this, void 0, void 0, function* () {
            let completed = false;
            try {
                yield this.db.writeData(`/Warrants/${this.userId}/${id}/Active`, state);
                completed = true;
            }
            catch (e) { }
            return completed;
        });
    }
    deleteWarrant(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let completed = false;
            try {
                yield this.db.writeData(`/Warrants/${this.userId}/${id}`, null);
                completed = true;
            }
            catch (e) { }
            return completed;
        });
    }
}
exports.Player = Player;
