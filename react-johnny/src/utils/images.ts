export const normalizeImageUrl = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^(data:|blob:|https?:\/\/|\/)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-zA-Z]:\\/.test(trimmed)) {
    return "";
  }

  return trimmed;
};
