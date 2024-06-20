import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./DisplayBooks.css";
import Sidebar from "../Sidebar/Sidebar";
const DisplayBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Books fetched:", booksList);
        setBooks(booksList);
        setError(null);
      } catch (error) {
        console.error("Error fetching books: ", error);
        setError("Error fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        {/* OR for three dots, uncomment the below code and comment out the spinner */}
        {/* <div className="dots">
          <div></div>
          <div></div>
          <div></div>
        </div> */}
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <Sidebar />
      <div className="container mt-4">
        <h2 className="mb-4">كتب الفقه</h2>
        {books.length > 0 ? (
          <div className="row">
            {books.map((book) => (
              <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={book.id}>
                <div className="card h-100">
                  {book.imgOne && (
                    <img
                      className="card-img-top"
                      src={book.imgOne}
                      alt={`${book.nameBook} cover`}
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body p-2">
                    <h5 className="card-title text-center mb-2">{book.nameBook}</h5>
                    <p className="card-text mb-1">
                      <strong>المؤلف:</strong> {book.nameWriter}
                    </p>
                    <p className="card-text mb-1">
                      <strong>السعر:</strong> ج{book.priceBook}
                    </p>
                    <p className="card-text mb-1">
                      <strong>الكمية:</strong> {book.quantity}
                    </p>
                    <p className="card-text mb-1">
                      <strong>القسم:</strong> {book.category}
                    </p>
                    <button className="btn btn-success w-100 mt-2">شراء الأن</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No books available.</p>
        )}
      </div>
    </>
  );
};

export default DisplayBooks;
