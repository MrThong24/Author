export const formatCurrencyDecimalVND = (value: number, decimalDigits = 0) => {
  // Check if value is a valid number
  if (isNaN(value)) {
    return 'Invalid number';
  }

  // Format the number with specified decimal digits
  const formatter = value?.toLocaleString('vi-VN', {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits
  });

  return formatter;
};
export const removeVietnameseAccents = (str: string) => {
  return str
    .normalize('NFD') // Tách dấu khỏi chữ cái gốc
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .toLowerCase(); // Chuyển về chữ thường
};
