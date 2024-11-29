import * as React from "react";
import { BookProvider, useBook } from "./BookContext";

export const BookForm = () => {
  const { book, changeName } = useBook();

  return (
    <div>
      <h1>Book: {book.name}</h1>

      <input value={book.name} onChange={e => changeName(e.target.value)} />
    </div>
  );
};

export function App2() {
  return (
    <BookProvider>
      <BookForm />
    </BookProvider>
  );
}
