"use client";
import { useState, useEffect } from "react";
import Summernote from "./Summernote";

export function SummernoteWrapper() {
  const [value, setValue] = useState("");
  const onChange = (value: string) => {
    setValue(value);
  }

  return (
    <div>
      <Summernote
        value={value}
        onChange={onChange} />
    </div>
  );
}