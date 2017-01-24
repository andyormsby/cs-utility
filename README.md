# DreamHouse Bot for Alexa

A Salesforce-powered Alexa Skill for the DreamHouse sample application.

Follow the instructions below to create your own instance of the skill:


### Step 1: Install the DreamHouse App

If you haven't already done so, follow [these instructions](http://dreamhouse-site.herokuapp.com/installation/) to install the DreamHouse sample application.

### Step 2: Create a Connected App

If you haven't already done so, follow the steps below to create a Salesforce connected app:

1. In Salesforce Setup, type **Apps** in the quick find box, and click the **Apps** link

1. In the **Connected Apps** section, click **New**, and define the Connected App as follows:

    - Connected App Name: MyConnectedApp (or any name you want)
    - API Name: MyConnectedApp
    - Contact Email: enter your email address
    - Enabled OAuth Settings: Checked
    - Callback URL: http://localhost:8200/oauthcallback.html (You'll change this later)
    - Selected OAuth Scopes: Full Access (full)
    - Click **Save**

### Step 3: Deploy the DreamHouse Alexa Skill

1. Make sure you are logged in to the [Heroku Dashboard](https://dashboard.heroku.com/)
1. Click the button below to deploy the Alexa Skill on Heroku:

    [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Fill in the config variables as described.

    - For **SF_CLIENT_ID**, enter the Consumer Key of your Salesforce Connected App
    - For **SF_CLIENT_SECRET**, enter the Consumer Secret of your Salesforce Connected App
    - For **SF_USER_NAME**, enter the the username of your Salesforce integration user
    - For **SF_PASSWORD**, enter the the username of your Salesforce integration user

### Step 4: Create an Amazon AWS account

If you don't already have an AWS account, follow the steps below to create one:

1. Open a browser and access the AWS Console: http://aws.amazon.com/
 
1. Click **Create an AWS Account** 

### Step 5: Configure the Skills

1. Login to the Alexa console: https://developer.amazon.com/edw/home.html

1. Click **Get Started** in the **Alexa Skills Kit** tile

1. Click the **Add New Skill** button

1. Fill in the **Skill Information** screen as follows:

    - Skill Type: **Custom Interaction Model**
    - Name: **DreamHouse**
    - Invocation Name: **dreamhouse**
    
1. On the **Interaction Model** Screen:    
    - Paste the following JSON document in the **Intent Schema** box:

        ```
        {
        "intents": [
         {
           "intent": "SearchHouses"
         },
         {
           "intent": "AnswerCity",
           "slots": [
             {
               "name": "City",
               "type": "AMAZON.US_CITY"
             }
           ]
         },
         {
           "intent": "AnswerNumber",
           "slots": [
             {
               "name": "NumericAnswer",
               "type": "AMAZON.NUMBER"
             }
           ]
         },
         {
           "intent": "Changes",
           "slots": [
             {
               "name": "City",
               "type": "AMAZON.US_CITY"
             }
           ]
         },
         {
           "intent": "AMAZON.HelpIntent"
         }
        ]
        }
        ```
    - Paste the following text in the **Sample Utterances** box:
     
        ```
        SearchHouses for listings
        SearchHouses to search for houses
        SearchHouses what's for sale
        SearchHouses what is for sale
        AnswerCity {City}
        AnswerNumber {NumericAnswer}
        Changes for changes
        Changes for price changes
        ```
     
1. On the **Configuration** screen, select **HTTPS**, and enter the URL of the Heroku app you deployed in Step 3, followed by the /dreamhouse path. For example:
     
     ```
     https://myalexabot.herokuapp.com/dreamhouse
     ```

1. On the **SSL certificate** screen, select **My development endpoint is a subdomain of a domain that has a wildcard certificate from a certificate authority**
  
1. You are now ready to test the DreamHouse skill.  
     # cs-utility
