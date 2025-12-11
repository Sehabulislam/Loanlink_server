const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri =
  `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASS}@cluster0.cjsthkf.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Loan Link server is running.");
});
async function run() {
  try {
    await client.connect();
    const loanLinkDB = client.db("loanLinkDB");
    const loansCollection = loanLinkDB.collection("loans");

    app.get("/availableLoans", async (req, res) => {
      const cursor = loansCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/loans", async (req, res) => {
      const cursor = loansCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/loans/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await loansCollection.findOne(query);
      res.send(result);
    });

    app.post("/loans",async(req,res)=>{
        const loan = req.body;
        const result = await loansCollection.insertOne(loan);
        res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
