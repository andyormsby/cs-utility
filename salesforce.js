"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD;

let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = () => {
    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
};

let getNewsCount = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT COUNT() 
                    FROM FeedItem 
                    WHERE ParentId 
                        IN (SELECT Id
                            FROM RSS_Feed__c
                            WHERE Name = 'Reuters UK Financial News') 
                        AND CreatedDate = TODAY`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                console.log(JSON.stringify(resp));
                resolve(resp.totalSize);
            }
        });
    });
};

let getOverdueClientCount = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT COUNT_DISTINCT(Client__r.name)
                FROM IB_Onboarding__c
                WHERE Overdue_Tasks__c > 0 AND I_Own__c = TRUE`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error has occurred");
            } else {
                console.log(JSON.stringify(resp));
                resolve(resp.records);
            }
        });
    });
};

let getTopNewsArticles = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT Title, Body 
                    FROM FeedItem 
                    WHERE ParentId 
                        IN (SELECT Id
                            FROM RSS_Feed__c
                            WHERE Name = 'Reuters UK Financial News') 
                        AND CreatedDate = TODAY LIMIT 2`;
                
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error has occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};


let findOverdueClients = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    Client__r.name
                FROM IB_Onboarding__c
                WHERE Overdue_Tasks__c > 0 AND I_Own__c = TRUE
                GROUP BY Client__r.name
                LIMIT 5`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error has occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};

let getEventCount = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT COUNT() 
                FROM Event 
                WHERE ActivityDate = TODAY`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error has occurred");
            } else {
                resolve(resp.totalSize);
            }
        });
    });
};

let getEvents = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT Start_Time__c,Subject 
                FROM Event 
                WHERE ActivityDate = TODAY
                ORDER BY StartDateTime ASC`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error has occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};

login();

exports.org = org;
exports.getNewsCount = getNewsCount;
exports.getOverdueClientCount = getOverdueClientCount;
exports.getTopNewsArticles = getTopNewsArticles;
exports.findOverdueClients = findOverdueClients;
exports.getEvents = getEvents;
exports.getEventCount = getEventCount;
