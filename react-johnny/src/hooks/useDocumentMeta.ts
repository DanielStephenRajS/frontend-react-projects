import { useEffect } from "react";

export const useDocumentMeta = (title: string, description: string): void => {
  useEffect(() => {
    document.title = `${title} | Johnny Fishing Tackle`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    }
  }, [title, description]);
};
