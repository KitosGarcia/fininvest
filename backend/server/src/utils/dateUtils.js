exports.calculateDueDate = (referenceMonth) => {
  const [year, month] = referenceMonth.split("-").map(Number);
  const nextMonth = new Date(year, month, 1);
  let count = 0;
  let day = 1;

  while (count < 8) {
    const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) count++;
    day++;
  }

  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day - 1)
    .toISOString()
    .split("T")[0];
};
