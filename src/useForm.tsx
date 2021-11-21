import * as React from "react";
import { useReducer, ChangeEvent, FormEventHandler, useState } from "react";

type AnyFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function useForm<T>(initial: T): [T, (event: ChangeEvent<AnyFieldElement>) => void, (diff: Partial<T>) => void] {
  const [gettor, settor] = useReducer((prevState: T, payloadForMergeAction: Partial<T>) => ({ ...prevState, ...payloadForMergeAction } as T), initial);
  const setFromEvent = (event: ChangeEvent<AnyFieldElement>): void => {
    const element = event.target;
    const name = element.getAttribute("name") || element.getAttribute("id") || element.tagName + Date.now();
    settor({ [name]: element.value } as Partial<T | any>);
  };
  return [gettor, setFromEvent, settor];
}

const RegisterForm = ({ submit }: { submit: FormEventHandler<HTMLFormElement> }) => {
  const [form, updateForm, merge] = useForm({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  return (
    <form onSubmit={submit}>
      <input name="username" value={form.username} onChange={updateForm} />
      <input name="password" value={form.password} onChange={updateForm} />
      <input name="password2" value={form.confirmPassword} onChange={e => merge({ confirmPassword: e.target.value })} />
      <button name="multipleSubmitButtonsActLikeRadioButtons" value="option1" type="submit" />
      <button name="multipleSubmitButtonsActLikeRadioButtons" value="option22" type="submit" />
    </form>
  );
};

const RegisterForm2 = ({ submit }: { submit: FormEventHandler<HTMLFormElement> }) => {
  const [username, setUsername] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [email, setemail] = useState("");

  return (
    <form onSubmit={submit}>
      <input name="username" value={username} onChange={e => setUsername(e.target.value)} />
      <input name="password" value={password} onChange={e => setpassword(e.target.value)} />
      <input name="password2" value={confirmPassword} onChange={e => setconfirmPassword(e.target.value)} />
      <button name="multipleSubmitButtonsActLikeRadioButtons" value="option1" type="submit" />
      <button name="multipleSubmitButtonsActLikeRadioButtons" value="option22" type="submit" />
    </form>
  );
};
