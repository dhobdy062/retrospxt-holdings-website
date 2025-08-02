import { Composio } from "@composio/core";
import { OpenAI } from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check if required environment variables are set
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is not set");
    console.log("Please create a .env file with your OpenAI API key");
    process.exit(1);
}

if (!process.env.COMPOSIO_API_KEY) {
    console.error("Error: COMPOSIO_API_KEY environment variable is not set");
    console.log("Please create a .env file with your Composio API key");
    process.exit(1);
}

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Composio with API key from environment
const composio = new Composio({
    apiKey: process.env.COMPOSIO_API_KEY
});

const userEmail = "don@dhobdyjr.com";

async function setupGmailConnection() {
    try {
        console.log("Starting Gmail authorization process...");
        
        const connectionRequest = await composio.toolkits.authorize(userEmail, "gmail");
        
        // redirect the user to the OAuth flow
        const redirectUrl = connectionRequest.redirectUrl;
        console.log("Redirect URL:", redirectUrl);
        
        // wait for connection to be established
        await connectionRequest.waitForConnection();
        console.log("Connection established successfully!");
        
        return connectionRequest;
    } catch (error) {
        console.error("Error setting up Gmail connection:", error);
        throw error;
    }
}

// Execute the setup
setupGmailConnection()
    .then(() => {
        console.log("Gmail integration setup completed!");
    })
    .catch((error) => {
        console.error("Failed to setup Gmail integration:", error);
    });