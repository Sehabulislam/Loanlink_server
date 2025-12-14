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
const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASS}@cluster0.cjsthkf.mongodb.net/?appName=Cluster0`;

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
    const usersCollection = loanLinkDB.collection("users");
    const applyLoanCollection = loanLinkDB.collection("applyLone");
    //----------------------users related api --------------------
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/users/:email/role',async(req,res)=>{
      const email = req.params.email;
      const query = {email};
      const user = await usersCollection.findOne(query);
      res.send({role : user?.role || 'user'})
    })
    app.post("/users", async (req, res) => {
      const user = req.body;
      if (!user.role) {
        user.role = "borrower";
      }
      user.createdAt = new Date();

      const email = user.email;
      const userExists = await usersCollection.findOne({ email });
      if (userExists) {
        return res.send({ message: "user exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //----------------------loan related api --------------------
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
    //--------------------apply lone related apis-------------
    app.post('/applyLoans',async(req,res)=>{
      const loan = req.body;
      loan.status = 'pending'
      loan.applicationFee = 'unpaid'
      const result = await applyLoanCollection.insertOne(loan);
      res.send(result)
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
