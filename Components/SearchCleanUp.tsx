"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Define a unique key for session storage to avoid conflicts
const SESSION_STORAGE_KEY = "lastSeenSearchQuery";

export default function SearchCleanup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Get the current search query from the URL
    const currentSearch = searchParams.get("search");

    // Get the previously seen search query from session storage
    const lastSeenSearch = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (currentSearch) {
      // ✅ This is the key logic:
      // If the search param in the URL is the SAME as the one we already stored,
      // it means this is a refresh of that search page.
      if (currentSearch === lastSeenSearch) {
        // It's a refresh, so clean up the URL.
        router.replace(pathname);
        // Important: Remove the key after cleanup.
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        // It's a NEW search. Do NOT clean up.
        // Instead, record this new search query for the next potential refresh.
        sessionStorage.setItem(SESSION_STORAGE_KEY, currentSearch);
      }
    } else {
      // If there's no search query in the URL, ensure storage is also clean.
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [searchParams, router, pathname]);

  return null; // This component doesn't render anything
}
