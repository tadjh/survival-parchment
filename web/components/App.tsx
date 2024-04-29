import React from "react";
import { mockNuiEvents } from "../utils/debugData";
import Form from "./Form";
import { ErrorBoundary } from "react-error-boundary";
// import { FaX } from "react-icons/fa6";

// This will set the NUI to visible if we are
// developing in browser
mockNuiEvents([
  {
    action: "setIsVisible",
    payload: true,
  },
]);

export default function App() {
  return (
    <div className="flex h-full items-center justify-center tracking-tight">
      <div className="relative flex w-full max-w-xl flex-col gap-4 rounded-lg bg-gradient-to-b from-cyan-900 to-cyan-950 p-8 text-white shadow-2xl">
        <h1 className="text-xl">Parchment</h1>
        {/* <div className="absolute right-8 top-8">
          <FaX className="h-4 w-4 text-teal-300/50 outline outline-1 outline-offset-1 outline-teal-300/50 drop-shadow-[0_3px_3px_rgba(110,231,183,0.5)] transition-colors hover:text-teal-300 hover:outline-teal-300" />
        </div> */}
        <ErrorBoundary fallback={<i>Something went wrong...</i>}>
          <Form />
        </ErrorBoundary>
      </div>
    </div>
  );
}
