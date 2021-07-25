const removeAllOccurrencesFromString = (str, occurrence) => {
  while (str.includes(occurrence)) {
    str = str.replace(occurrence, "");
  }

  return str;
};

module.exports = { removeAllOccurrencesFromString };
