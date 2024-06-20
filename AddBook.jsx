import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

const AddBook = () => {
  const [book, setBook] = useState({
    category: '',
    nameBook: '',
    nameWriter: '',
    priceBook: '',
    quantity: ''
  });
  const [images, setImages] = useState({ imgOne: null, imgTwo: null, imgThree: null });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        console.log('Signed in anonymously');
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
        setError('فشل في تسجيل الدخول المجهول.');
      });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!book.nameBook) newErrors.nameBook = 'يجب إدخال إسم الكتاب';
    if (!book.nameWriter) newErrors.nameWriter = 'يجب إدخال إسم المؤلف';
    if (!book.priceBook || book.priceBook <= 0) newErrors.priceBook = 'يجب إدخال سعر الكتاب (أكبر من 0)';
    if (!book.category) newErrors.category = 'يجب إدخال قسم الكتاب';
    if (!images.imgOne) newErrors.imgOne = 'يجب رفع الصورة الأولى';
    if (!book.quantity || book.quantity <= 0) newErrors.quantity = 'يجب إدخال كمية الكتاب (أكبر من 0)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (image) => {
    const imageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(imageRef, image);
    return getDownloadURL(imageRef);
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {

      const imgOneUrl = await uploadImage(images.imgOne);
      const imgTwoUrl = images.imgTwo ? await uploadImage(images.imgTwo) : '';
      const imgThreeUrl = images.imgThree ? await uploadImage(images.imgThree) : '';

      const bookData = {
        ...book,
        imgOne: imgOneUrl,
        imgTwo: imgTwoUrl,
        imgThree: imgThreeUrl,
      };

      const booksRef = collection(db, 'books');
      await addDoc(booksRef, bookData);
      setMessage('تم إضافة الكتاب بنجاح!');
      setError('');
      resetForm();
    } catch (error) {
      console.error('Error adding document: ', error);
      setError('فشل في إضافة الكتاب.');
      setMessage('');
    }
  };

  const resetForm = () => {
    setBook({
      category: '',
      nameBook: '',
      nameWriter: '',
      priceBook: '',
      quantity: ''
    });
    setImages({ imgOne: null, imgTwo: null, imgThree: null });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
    if (errors[name]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setImages({ ...images, [name]: files[0] });
      if (errors[name]) {
        setErrors((prevErrors) => {
          const updatedErrors = { ...prevErrors };
          delete updatedErrors[name];
          return updatedErrors;
        });
      }
    }
  };

  return (
    <div className="container my-4 w-75">
      <h2 className="mb-4 text-center">إضافة كتاب جديد</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form className='w-75 m-auto bg-light p-4 rounded' onSubmit={addBook}>
        <div className="mb-3">
          <label htmlFor="nameBook" className="form-label">إسم الكتاب</label>
          <input
            type="text"
            className={`form-control ${errors.nameBook ? 'is-invalid' : ''}`}
            id="nameBook"
            name="nameBook"
            value={book.nameBook}
            onChange={handleChange}
          />
          {errors.nameBook && <div className="invalid-feedback">{errors.nameBook}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="nameWriter" className="form-label">إسم المؤلف</label>
          <input
            type="text"
            className={`form-control ${errors.nameWriter ? 'is-invalid' : ''}`}
            id="nameWriter"
            name="nameWriter"
            value={book.nameWriter}
            onChange={handleChange}
          />
          {errors.nameWriter && <div className="invalid-feedback">{errors.nameWriter}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="priceBook" className="form-label">سعر الكتاب</label>
          <input
            type="number"
            className={`form-control ${errors.priceBook ? 'is-invalid' : ''}`}
            id="priceBook"
            name="priceBook"
            value={book.priceBook}
            onChange={handleChange}
          />
          {errors.priceBook && <div className="invalid-feedback">{errors.priceBook}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">قسم الكتاب</label>
          <input
            type="text"
            className={`form-control ${errors.category ? 'is-invalid' : ''}`}
            id="category"
            name="category"
            value={book.category}
            onChange={handleChange}
          />
          {errors.category && <div className="invalid-feedback">{errors.category}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="imgOne" className="form-label">الصورة الأولي</label>
          <input
            type="file"
            className="form-control"
            id="imgOne"
            name="imgOne"
            onChange={handleImageChange}
          />
          {errors.imgOne && <div className="invalid-feedback">{errors.imgOne}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="imgTwo" className="form-label">الصورة الثانية</label>
          <input
            type="file"
            className="form-control"
            id="imgTwo"
            name="imgTwo"
            onChange={handleImageChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="imgThree" className="form-label">الصورة الثالثة</label>
          <input
            type="file"
            className="form-control"
            id="imgThree"
            name="imgThree"
            onChange={handleImageChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="quantity" className="form-label">كمية الكتاب</label>
          <input
            type="number"
            className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
            id="quantity"
            name="quantity"
            value={book.quantity}
            onChange={handleChange}
          />
          {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
        </div>
        <button type="submit" className="btn btn-success w-100">إضافة الكتاب</button>
      </form>
    </div>
  );
};

export default AddBook;
