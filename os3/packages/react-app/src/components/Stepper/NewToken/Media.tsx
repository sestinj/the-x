import React from "react";
import FormPage from "../FormPage";

const Media = () => {
  return (
    <FormPage>
      <p>Token Logo</p>
      <input type="file"></input>

      <p>Description</p>
      <textarea placeholder="Description"></textarea>
    </FormPage>
  );
};

export default Media;
