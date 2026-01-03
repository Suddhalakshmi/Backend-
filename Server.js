const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Book = require("./models/Book");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/libraryDB")
  .then(() => console.log("Connected to local MongoDB"))
  .catch(err => console.error(err));

/* CREATE */
app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    const saved = await book.save();
    res.status(201).json(saved);
  } catch {
    res.status(400).json({ error: "Invalid book data" });
  }
});

/* READ ALL */
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

/* READ BY CATEGORY */
app.get("/books/category/:category", async (req, res) => {
  const books = await Book.find({ category: req.params.category });
  res.json(books);
});

/* READ AFTER 2015 */
app.get("/books/after/2015", async (req, res) => {
  const books = await Book.find({ publishedYear: { $gt: 2015 } });
  res.json(books);
});

/* UPDATE COPIES */
app.put("/books/:id/copies", async (req, res) => {
  const { change } = req.body;
  const book = await Book.findById(req.params.id);

  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.availableCopies + change < 0)
    return res.status(400).json({ error: "Negative stock not allowed" });

  book.availableCopies += change;
  await book.save();
  res.json(book);
});

/* UPDATE CATEGORY */
app.put("/books/:id/category", async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { category: req.body.category },
    { new: true }
  );

  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

/* DELETE IF COPIES = 0 */
app.delete("/books/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.availableCopies !== 0)
    return res.status(400).json({ error: "Cannot delete book with copies" });

  await book.deleteOne();
  res.json({ message: "Book deleted" });
});

app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000")
);
