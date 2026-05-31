import { toast } from "@/hooks/use-toast";

/**
 * Interface for API errors that might contain a user-friendly message
 */
interface ApiError {
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Centralized error handler for the application.
 * Shows a toast with a Hebrew message.
 */
export function handleError(error: unknown, fallbackMessage: string = "אופס, משהו לא עובד") {
  console.error("Application Error:", error);

  let message = fallbackMessage;

  // Try to extract a meaningful message from the error object
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "object" && error !== null) {
    const apiErr = error as any;
    
    // Handle Zod validation errors from API
    if (apiErr.error === "Validation failed" && Array.isArray(apiErr.details)) {
      message = "נתונים לא תקינים: " + apiErr.details.map((d: any) => d.message).join(", ");
    } else {
      message = apiErr.message || apiErr.error || fallbackMessage;
    }
  }

  // Detect if the message is English/Generic
  const isEnglish = /[a-zA-Z]/.test(message);
  const isGeneric = message.includes("fetch") || message.includes("Network") || message.includes("Unexpected token") || message.includes("404") || message.includes("500");

  // If it's a generic system error or in English, and it's not our specific fallback, use the "אופס" message
  const finalDescription = (isEnglish || isGeneric) && message !== fallbackMessage 
    ? fallbackMessage 
    : message;

  toast({
    variant: "destructive",
    title: "שגיאה",
    description: finalDescription,
  });
}
