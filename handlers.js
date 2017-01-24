"use strict";

let salesforce = require("./salesforce");

var invoked = false;

exports.SearchHouses = (slots, session, response) => {
    session.attributes.stage = "ask_city";
    response.ask("OK, in what city?");
};

exports.AnswerCity = (slots, session, response) => {
    if (session.attributes.stage === "ask_city") {
        session.attributes.city = slots.City.value;
        session.attributes.stage = "ask_bedrooms";
        response.ask("How many bedrooms?");
    } else {
        response.say("Sorry, I didn't understand that");
    }
};

exports.AnswerNumber = (slots, session, response) => {
    if (session.attributes.stage === "ask_bedrooms") {
        session.attributes.bedrooms = slots.NumericAnswer.value;
        session.attributes.stage = "ask_price";
        response.ask("Around what price?");
    } else if (session.attributes.stage === "ask_price") {
        let price = slots.NumericAnswer.value;
        session.attributes.price = price;
        let priceMin = price * 0.8;
        let priceMax = price * 1.2;
        salesforce.findProperties({city: session.attributes.city, bedrooms: session.attributes.bedrooms, priceMin: priceMin, priceMax: priceMax})
            .then(properties => {
                if (properties && properties.length>0) {
                    let text = `OK, here is what I found for ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around $${price}: `;
                    properties.forEach(property => {
                        text += `${property.get("Address__c")}, ${property.get("City__c")}: $${property.get("Price__c")}. <break time="0.5s" /> `;
                    });
                    response.say(text);
                } else {
                    response.say(`Sorry, I didn't find any ${session.attributes.bedrooms} bedrooms in ${session.attributes.city} around ${price}.`);
                }
            })
            .catch((err) => {
                console.error(err);
                response.say("Oops. Something went wrong");
            });
    } else {
        response.say("Sorry, I didn't understand that");
    }
};


exports.Summary = (slots, session, response) => {
    console.log('Summary...');
    let text = '';
    Promise.all([salesforce.getEventCount(), salesforce.getOverdueClientCount(), salesforce.getNewsCount()]).then(values => { 
      console.log('values = ', JSON.stringify(values));
      // values returns something that looks like:
      // [[{"expr0":6}],17] where 6 = number of overdue clients and 17 is count of news articles.
      let events = values[0];
      let overdues = values[1][0].get("expr0");
      let news = values[2];
      // console.log('Overdues = '+overdues);
      if (events == 0) {
        text += 'Your calendar is empty.';
      } else {
        if (events == 1) {
            text += 'You have one item in todays calendar';
        } else {
            text += 'You have '+events+' entries in todays calendar';
        }
      }
      text += `<break time="0.3s"/>`;
      text += 'There are '+overdues+ ' clients with overdue onboarding tasks';
      text += `<break time="0.2s"/>`;
      text += 'And there are '+news+' news articles';
      response.say(text);
    })
    .catch((err) => {
        console.error(err);
        reponse.say("I'm terribly sorry. There appears to be a problem");
    });
};


exports.TopNews = (slots, session, response) => {
    salesforce.getTopNewsArticles()
        .then(articles => {
            console.log(JSON.stringify(articles));
            if (articles && articles.length > 0) {
                let text = `Here are the top news stories for today.<break time="0.3s"/>`;
                articles.forEach(article => {
                    //console.log("article = " + article);
                    text += `${article.get("body")}.<break time="0.2s"/>`;
                });
                response.say(text);
            } else {
                response.say("No news stories are available for today.");
            }
        })  
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};

exports.Calendar = (slots, session, response) => {
    salesforce.getEvents()
        .then(events => {
            let text = "";
            console.log("events = "+ events);
            if (events && events.length > 0) {
                if (events.length == 1) {
                    text += `You have 1 event today.<break time="0.3s"/>`;
                } else {
                    text += "You have "+events.length+" events in your calendar for today";
                    text += `<break time="0.3s"/>`;
                }
                
                events.forEach(event => {
                    console.log("event = " + event);
                    text += `At ${event.get("start_time__c")}.<break time="0.1s"/> ${event.get("subject")}.<break time="0.2s"/>`;
                });
                response.say(text);
            } else {
                response.say("There are no events showing in today's calendar for you.");
            }
        })  
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};


exports.Overdue = (slots, session, response) => {
    salesforce.findOverdueClients()
        .then(clients => {
            let text = "";
            let clientnum = 1;
            if (clients && clients.length > 0) {
                text += "There are overdue onboarding tasks for "+clients.length+" clients: ";
                text += `<break time="0.3s"/>`;

                console.log("Clients");
                console.log(JSON.stringify(clients));
                clients.forEach(client => {
                    text += `${clientnum}.<break time="0.1s"/>`;
                    text += `${client.get("name")}.<break time="0.2s"/>`;
                    clientnum++;
                });
            } else {
                text += "There are no overdue onboarding tasks at present.";
            }
            
            response.say(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};

exports.AskReminder = (slots, session, response) => {
    session.attributes.stage = "AskReminder";

    salesforce.findOverdueClients()
        .then(clients => {
            let text = "";
            let clientnum = 1;
            if (clients && clients.length > 0) {
                text += "Which client do you want to send a reminder to?  ";
                text += `<break time="0.3s"/>`;

                clients.forEach(client => {
                    text += `${clientnum}.<break time="0.1s"/>`;
                    text += `${client.get("name")}.<break time="0.2s"/>`;
                    clientnum++;
                });

            } // ignore the possibility that there are no overdue clients - for now.
            response.ask(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};

exports.SendReminder = (slots, session, response) => {
    if ( session.attributes.stage === "AskReminder" ) {
        session.attributes.clientno = slots.NumericAnswer.value;
        session.attributes.stage = "SendReminder";
    }

    salesforce.findOverdueClients()
        .then(clients => {
            let text = "";
            if (clients && clients.length > 0) {
                text += "OK, sending a reminder to ";
                text += `${clients[session.attributes.clientno - 1].get("name")}`;
                
                // do some magic to actually send the notification...

            } // ignore the possibility that there are no overdue clients - for now.
            response.say(text);
        })
        .catch((err) => {
            console.error(err);
            response.say("Oops. Something went wrong");
        });
};

