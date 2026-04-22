export default function getReadableDate(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = String(date.getDate());

  let ord;

  switch (true) {
    case day.endsWith("1"):
      ord = "st";
      break;
    case day.endsWith("2"):
      ord = "nd";
      break;
    case day.endsWith("3"):
      ord = "rd";
      break;
    default:
      ord = "th";
  }
  const month = date.getMonth();
  const year = date.getFullYear();
  const full = `${day}${ord} ${months[month]}, ${year}`;
  return full;
}
