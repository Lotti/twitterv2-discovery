# twitterv2-discovery

An application that retrieves tweets from filtered stream using Twitter V2 API.<br/> Tweets can be stored on disk (if app runs locally), on IBM Cloud Object Storage or directly on IBM Watson Discovery (a cognitive search engine).


Push on the button below to deploy an instance of this application on IBM Cloud (IBM Cloud account required, it's free).<br/>
A deployment pipeline will be created that will fork this repo inside IBM Cloud, with an online editor and build & deploy stages. 


[![Deploy to IBM Cloud](https://cloud.ibm.com/devops/setup/deploy/button_x2.png)](https://cloud.ibm.com/devops/setup/deploy?repository=https://github.com/Lotti/twitterv2-discovery.git&branch=main)


**The manifest.yaml is set up for deployment on Frankfurt region (eu-de)**.<br/> Please modify it accordingly with the region where you want to deploy it (e.g.: eu-gb for London, us-south for Dallas, au-syd for Sydney, etc.) 

---
Credentials needed to run this software (the app does support .env file. please refer to .env.sample file)<br/>
COS credentials are not needed if you are using Discovery to store tweets and viceversa.

```
STORAGE_MODE="..."
TWITTER_API_KEY="..."
TWITTER_SECRET_KEY="..."
COS_ENDPOINT="..."
COS_API_KEY="..."
COS_IBM_AUTH_ENDPOINT="..."
COS_SERVICE_INSTANCE_ID="..."
COS_BUCKET_NAME="..."
DISCOVERY_ENDPOINT="..."
DISCOVERY_API_KEY="..."
DISCOVERY_COLLECTION_ID="..."
DISCOVERY_ENVIRONMENT_ID="..."
```
---
To run this app locally, just type `npm install` and `npm start`.  
