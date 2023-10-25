import Fetchy from "./fetchy";

export default class BooksClient {
    #apiKey = "AIzaSyAyl4e5KIGq1tXr9tDF5NKcJO9hTyOt5XU";
    fetchyInstance;

    constructor() { 
        this.fetchyInstance = new Fetchy("https://www.googleapis.com/books/v1/volumes");
    }

    async search() {
        const args = Object.values(arguments);
        const hasNonStringArguments = args.any(arg => typeof(arg) !== "string");
        if (hasNonStringArguments) {
            throw new TypeError("non-string search terms are forbidden.");
        }

        
    }
}