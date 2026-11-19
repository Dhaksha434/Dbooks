
const API_URL = "/books";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const message = document.getElementById("message");

const bookId = document.getElementById("bookId");
const title = document.getElementById("title");
const author = document.getElementById("author");
const price = document.getElementById("price");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("form-title");

// Display success or error messages
function showMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}

// API helper function
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// GET /books - Fetch all books
async function getBooks() {
    bookList.textContent = "Loading books...";

    try {
        const books = await apiRequest(API_URL);

        displayBooks(books);

    } catch (error) {
        bookList.textContent = "Unable to load books.";
        showMessage(error.message, "error");
    }
}

// Display books dynamically
function displayBooks(books) {
    bookList.replaceChildren();

    if (books.length === 0) {
        bookList.textContent = "No books available.";
        return;
    }

    books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";

        const heading = document.createElement("h3");
        heading.textContent = book.title;

        const idText = document.createElement("p");
        idText.textContent = "Book ID: " + book.id;

        const authorText = document.createElement("p");
        authorText.textContent = "Author: " + book.author;

        const priceText = document.createElement("p");
        priceText.textContent = "Price: ₹" + book.price.toFixed(2);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.addEventListener("click", () => {
            editBook(book.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            deleteBook(book.id);
        });

        card.append(
            heading,
            idText,
            authorText,
            priceText,
            editBtn,
            deleteBtn
        );

        bookList.appendChild(card);
    });
}

// POST /books or PUT /books/:id
bookForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = bookId.value;

    const bookData = {
        title: title.value.trim(),
        author: author.value.trim(),
        price: Number(price.value)
    };

    const isEditing = Boolean(id);

    const url = isEditing
        ? `${API_URL}/${id}`
        : API_URL;

    const method = isEditing ? "PUT" : "POST";

    try {
        const data = await apiRequest(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookData)
        });

        showMessage(data.message, "success");

        resetForm();
        await getBooks();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

// GET /books/:id - Retrieve a particular book
// Populate the form for editing
async function editBook(id) {
    try {
        const book = await apiRequest(`${API_URL}/${id}`);

        bookId.value = book.id;
        title.value = book.title;
        author.value = book.author;
        price.value = book.price;

        formTitle.textContent = "Update Book";
        submitBtn.textContent = "Update Book";
        cancelBtn.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// DELETE /books/:id - Delete a book
async function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    try {
        const data = await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showMessage(data.message, "success");

        await getBooks();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// Reset form after adding or updating
function resetForm() {
    bookForm.reset();
    bookId.value = "";

    formTitle.textContent = "Add New Book";
    submitBtn.textContent = "Add Book";
    cancelBtn.hidden = true;
}

// Cancel editing
cancelBtn.addEventListener("click", resetForm);

// Load books when page opens
getBooks();
