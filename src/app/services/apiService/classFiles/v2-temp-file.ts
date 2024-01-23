export class TempFileResult {
    constructor(
        public fileName: string = '',
        public uploaded: boolean = false,
        public temporaryUrl: string = ''
    ) { }
}
