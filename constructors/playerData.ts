import { Database } from "./datastore/database";

export class Player {
    private userId: number;
    private db: Database;

    constructor(userId: number) { 
        this.userId = userId;
        this.db = Database.getInstance("", "")
    }

    async getWarrants(): Promise<object|boolean> {
        let warrants: object | boolean = {}

        try {
            warrants = await this.db.getData(`/Warrants/${this.userId}`)
        } catch (e) {
            warrants = false
        }

        return warrants
    }
    
    async getArrests(): Promise<object | boolean> {
        let arrests: object | boolean = {}

        try {
            arrests = await this.db.getData(`/Arrests/${this.userId}`)
        } catch (e) {
            arrests = false
        }

        return arrests;
    }

    async saveWarrant(id: string, buffer: object): Promise<boolean> {
        let completed: boolean = false

        try {
            await this.db.writeData(`/Warrants/${this.userId}/${id}`, buffer)
            completed = true
        } catch (e) {}

        return completed;
    }

    async editWarrant(id: string, state: boolean): Promise<boolean> {
        let completed: boolean = false

        try {
            await this.db.writeData(`/Warrants/${this.userId}/${id}/Active`, state)
            completed = true
        } catch (e) {}

        return completed;
    }

    async deleteWarrant(id: string): Promise<boolean> {
        let completed: boolean = false

        try {
            await this.db.writeData(`/Warrants/${this.userId}/${id}`, null)
            completed = true
        } catch (e) {}

        return completed;
    }

    async saveArrestComment(id: string, comment: string): Promise<boolean> {
        let completed: boolean = false

        try {
            await this.db.appendData(`/Arrests/${this.userId}/${id}`, comment)
            completed = true
        } catch (e) {}

        return completed;
    }
}
