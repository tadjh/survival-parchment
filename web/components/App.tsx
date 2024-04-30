import React from "react";
import { mockNuiEvents } from "../utils/debugData";
import Form from "./Form";
import { ErrorBoundary } from "react-error-boundary";

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
        <ErrorBoundary fallback={<i>Something went wrong...</i>}>
          <Form />
        </ErrorBoundary>
      </div>
    </div>
  );
}
