const express = require("express");
const next = require("next");
const uuid = require("uuid");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const firebaseAdmin = require("firebase-admin");

var bodyParser = require("body-parser");

app.prepare().then(() => {
  const server = express();

  const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });

  server.get("/user/:name", async (req, res) => {
    const { name } = req.params;

    const db = admin.firestore();

    const allUsers = await db.collection("profile").get();

    const data = [];

    allUsers.forEach((item) => {
      if (item.exists) {
        const result = item.data();

        if (result.name === name) {
          data.push({
            ...result,
          });
        }
      }
    });

    let obj = {};

    if (data.length > 0) {
      obj = {
        ...data[0],
      };
    }

    res.status(200).json(obj);
  });

  server.get("/books", async (req, res) => {
    const db = admin.firestore();

    const allBooksCollection = await db.collection("books").get();

    const data = [];

    allBooksCollection.forEach((item) => {
      if (item.exists) {
        data.push({
          ...item.data(),
        });
      }
    });

    res.status(200).json(data);
  });

  server.get("/book/isbn/:isbn", async (req, res) => {
    const { isbn } = req.params;

    const db = admin.firestore();
    const allBooksCollection = await db.collection("books").get();

    const data = [];

    allBooksCollection.forEach((item) => {
      if (item.exists) {
        const result = item.data();

        if (result.isbn === isbn) {
          data.push({
            ...result,
          });
        }
      }
    });

    let payload = {};

    if (data.length > 0) {
      payload = {
        ...data[0],
      };
    }

    res.status(200).json(payload);
  });

  server.post("/addBook", async (req, res) => {
    const body = req.body;
    console.log(body);

    // const bookStructure = {
    //   title: body.title,
    //   author: body.author,
    //   isbn: body.isbn,
    // };

    // const db = admin.firestore();
    // await db.collection("books").doc(uuid.v4()).set(bookStructure);

    res.status(200).json({
      status: "done",
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
