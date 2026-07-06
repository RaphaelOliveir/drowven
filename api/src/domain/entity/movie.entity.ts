export class Movie {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly year: string,
        public readonly runtime: number,
        public readonly rating: string,
        public readonly genre: string,
        public readonly director: string,
    ) { }
}