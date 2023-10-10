const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    "username":"username",
    "password":"password"
}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let validusers = users.filter((user)=>{
        return (user.username === username)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60});

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send(`User logged in ! ${accessToken}`);
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});
// ADD BOOK REVIEW
regd_users.put("/auth/review/:id", (req, res) => {
    // Write your code here
    let bookId = req.params.id;
    let book = books[bookId];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    let reviewText = req.query.review;
    let username = req.body.username;

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required" });
    }

    book.reviews = book.reviews || {}; // Ensure reviews object exists
    book.reviews[username] = reviewText;

    return res.status(200).json({ message: `Review for book with ID ${bookId} added/updated successfully` });
});


// GET BOOK REVIEW
regd_users.get("/auth/review/:isbn", (req, res) => {
    //Write your code here
    let isbn = req.params.isbn;
    let review = books[isbn]["reviews"];
    return res.status(208).json({message: "The review for the book with ISBN "+isbn+" has been added/updated."});
});
// DELETE request:
regd_users.delete("/auth/review/:id", (req, res) => {
    // Write your code here
    let bookId = req.params.id;
    let book = books[bookId];
    if (!book || !book.reviews) {
        return res.status(404).json({ message: "Review not found" });
    }

    let username = req.body.username;
    if (!username || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for the specified username" });
    }

    delete book.reviews[username];
    return res.status(200).json({ message: `Review for book with ID ${bookId} and username ${username} deleted successfully` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;