#!/bin/bash

# Usage: ./deploy-functions.sh <APP_NAME> <RESOURCE_GROUP> <FRONTEND_URL>
# Example: ./deploy-functions.sh my-georoute-func my-resource-group https://my-frontend.vercel.app

APP_NAME=$1
RESOURCE_GROUP=$2
FRONTEND_URL=$3

if [ -z "$APP_NAME" ] || [ -z "$RESOURCE_GROUP" ] || [ -z "$FRONTEND_URL" ]; then
    echo "Error: Missing arguments."
    echo "Usage: ./deploy-functions.sh <APP_NAME> <RESOURCE_GROUP> <FRONTEND_URL>"
    exit 1
fi

# Navigate to the functions directory
cd "$(dirname "$0")/GeoRoute.Functions" || exit

echo "Building project..."
dotnet build -c Release

echo "Deploying to Azure Function App: $APP_NAME..."
# Using --force to ensure overwrite if needed, typically strictly not required but valid
func azure functionapp publish "$APP_NAME"

echo "Configuring CORS for $FRONTEND_URL..."
# Add the specific frontend URL
az functionapp cors add --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --allowed-origins "$FRONTEND_URL"

# Also allow localhost for local testing if needed, though this config is for the cloud app
# usually, you might want to allow your local dev environment to hit the PROD api? 
# Maybe not by default. I'll stick to the user's request.

echo "Deployment complete! Don't forget to update your frontend .env with the new backend URL."
