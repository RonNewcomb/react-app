import * as React from "react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface Book {
  name: string;
  desc: string;
}

interface IBookContext {
  book: Book;
  changeName: (name: string) => void;
}

const BookContext = createContext<IBookContext>(null!);

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [book, setBook] = useState<Book>({ name: "", desc: "" });

  const value = useMemo(() => {
    return {
      book,
      changeName: (name: string) => setBook(book => ({ ...book, name })),
    };
  }, [book]);

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export const useBook = () => {
  const value = useContext(BookContext);
  if (!value) throw new Error("useBook hook used without BookContext!");
  return value;
};
