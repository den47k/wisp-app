const required = (key: string, value: string | undefined): string => {
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

export const env = {
  apiUrl: required("VITE_API_URL", import.meta.env.VITE_API_URL),
  wsUrl: required("VITE_WS_URL", import.meta.env.VITE_WS_URL),
};
