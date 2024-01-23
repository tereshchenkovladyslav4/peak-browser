export class Reports {
}


export class UniqueUsers {
    signInDate: Date = new Date();
    uniqueLogins: number = 0;
}

export class UniqueUsersReportData {
    uniqueUsers: Array<UniqueUsers> = [];
    totalUniqueLogins: number = 0;
}

export class TopSearchTerms {
    searchTerm: string = "";
    numberOfSearches: number = 0;
}
export class TopSearchTermsData {
    searchData: Array<TopSearchTerms> = [];
    totalSearches: number = 0;
}