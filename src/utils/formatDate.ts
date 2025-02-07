export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const year = date.getFullYear().toString().slice(2); // YY
  const month = String(date.getMonth() + 1).padStart(2, "0"); // MM
  const day = String(date.getDate()).padStart(2, "0"); // DD

  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = String(hours % 12 || 12).padStart(2, "0"); // 12시간제
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
};
