"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    console.log(location.href); // now safe
  }, []);

  return <div>404 Page Not Found</div>;
}

