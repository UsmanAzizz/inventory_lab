export const toTitleCase = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(
    /\b\w/g,
    function(txt) {
      return txt.toUpperCase();
    }
  );
};
