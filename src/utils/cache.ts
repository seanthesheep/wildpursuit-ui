export const getCachedData = (key: string) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  return null;
};

export const setCachedData = (key: string, data: any) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
};