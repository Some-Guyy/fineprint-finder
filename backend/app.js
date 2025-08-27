const express = require('express')
const app = express()

const { ChromaClient } = require('chromadb');
const chroma = new ChromaClient({ 
    host: 'localhost',
    port: 8000,
    ssl: false
 });

// Test add collection and random documents
app.get("/add", async (req, res) => {
    const collection = await chroma.getOrCreateCollection({
        name: "my_collection",
    });
    await collection.add({
        ids: ["id1", "id2"],
        documents: [
            "This is a document about pineapple",
            "This is a document about oranges",
        ]
    });
    res.status(200).send("added docs");
})

// Test query the random document
app.get("/query", async (req, res) => {
    const collection = await chroma.getOrCreateCollection({
        name: "my_collection",
    });

    const results = await collection.query({
        queryTexts: ["This is a query document about hawaii"], // Chroma will embed this for you
        nResults: 2, // how many results to return
    });
    
    console.log(results); 
    res.status(200).send(results);       
})

// Clear test collection
app.get("/clear", async (req, res) => {
    // Get all collections
    const collections = await chroma.listCollections();

    // Delete each collection by name
    for (const collection of collections) {
        await chroma.deleteCollection({ name: collection.name });
        console.log(`Deleted collection: ${collection.name}`);
    }

    res.status(200).send("Cleared collections!");
})

// catch rogue calls
app.all("/{*splat}", (req, res) => {
    console.log("Unhandled route:", req.path)
    res.status(404).send("Route not found")
})

module.exports = { app }
