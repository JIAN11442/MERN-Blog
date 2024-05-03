const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// const days = [
//   'sunday',
//   'monday',
//   'tuesday',
//   'wednesday',
//   'thursday',
//   'friday',
//   'saturday',
// ];

export const getDay = (timestamp: string) => {
  const date = new Date(timestamp);

  // return `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`;
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getFullDay = (timestamp: string) => {
  const date = new Date(timestamp);

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
