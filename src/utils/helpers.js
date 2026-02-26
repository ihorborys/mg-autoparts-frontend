export const getDeliveryTime = (supplierId) => {
  const terms = {
    1: "7-14",    // AUTOPARTNER
    2: "10-18",   // AP_GDANSK
    3: "8-16",  // MOTOROL
    // Додавай своїх постачальників тут
  };
  return terms[supplierId] || "18-16";
};