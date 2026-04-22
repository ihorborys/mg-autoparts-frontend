export const getDeliveryTime = (supplierId) => {
  const terms = {
    1: "7-14",    // AUTOPARTNER
    2: "10-18",   // AP_GDANSK
    3: "8-16",  // MOTOROL
    // Додавай своїх постачальників тут
  };
  return terms[supplierId] || "18-16";
};


export const getSupplierName = (supplierId) => {
  const supplier = {
    1: "AUTOPARTNER",
    2: "AP_GDANSK",
    3: "MOTOROL",
    // Додавай своїх постачальників тут
  };
  return supplier[supplierId] || "ПОСТАЧАЛЬНИК";
};

export const DELIVERY_CONFIG = {
  np_branch: {
    label: "Нова Пошта (Відділення)",
    fieldLabel: "Номер відділення",
    placeholder: "Наприклад: №1",
    type: "branch",
    required: true,
  },
  np_courier: {
    label: "Нова Пошта (Кур'єр)",
    fieldLabel: "Адреса доставки",
    placeholder: "Вулиця, будинок, квартира",
    type: "address",
    required: true,
  },
  ukr_poshta: {
    label: "Укрпошта (Відділення)",
    fieldLabel: "Індекс або № відділення",
    placeholder: "Наприклад: 81400",
    type: "branch",
    required: true,
  },
  meest: {
    label: "Meest Express (Відділення)",
    fieldLabel: "Номер точки видачі",
    placeholder: "Наприклад: №1234",
    type: "branch",
    required: true,
  },
  meest_courier: {
    label: "Meest Express (Кур'єр)",
    fieldLabel: "Адреса доставки",
    placeholder: "Вулиця, будинок, квартира",
    type: "address",
    required: true,
  },
  self: {
    label: "Самовивіз (м. Самбір)",
    fieldLabel: "Коментар до отримання",
    placeholder: "Наприклад: Заберу сьогодні о 17:00",
    type: "note",
    required: false,
  },
};


export const formatPhoneToMask = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('380')) {
    const code = digits.slice(2, 5);
    const part1 = digits.slice(5, 8);
    const part2 = digits.slice(8, 10);
    const part3 = digits.slice(10, 12);
    return `+38 (${code}) ${part1}-${part2}-${part3}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
};