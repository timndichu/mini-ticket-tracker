
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  // Handle malformed JSON sent in the request body.
  if (
    err &&
    typeof err === "object" &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      error: "Invalid JSON",
      message: "The request body contains malformed JSON.",
    });
    return;
  }

  // Log the actual error for server-side debugging.
  console.error("Unhandled request error:", err);

  // Never expose database errors or stack traces to clients.
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred.",
  });
};
