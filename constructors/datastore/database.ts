export class Database {
    private static instance: Database;
    private baseURL: string;
    private authKey: string;

    constructor(baseURL: string, authKey: string) {
        this.baseURL = baseURL;
        this.authKey = authKey;
    }

    public static getInstance(baseURL: string, authKey: string): Database {
        if (!Database.instance) {
            Database.instance = new Database(baseURL, authKey);
        }
        return Database.instance;
    }


    async getData(path: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseURL}/${path}.json?auth=${this.authKey}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch data.');
            }
            
            return response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            return {}; 
        }
    }


    async writeData(path: string, dataToUpdate: any): Promise<any> {
        try {
            const url = `${this.baseURL}/${path}.json?auth=${this.authKey}`;
            const response = await fetch(url, {
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
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    async appendData(path: string, buffer: object | string | number): Promise<any> {
        try {
            const url = `${this.baseURL}/${path}.json?auth=${this.authKey}`;
            const response = await fetch(url, {
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
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }
}