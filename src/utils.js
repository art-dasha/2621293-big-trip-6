const capitalizeFirstLetter = (string) => {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];
export { getRandomArrayElement, capitalizeFirstLetter };
