export const removeVietnameseTones = (str: string): string => {
    return str
      .normalize('NFD') // Chuyển đổi ký tự sang dạng tổ hợp
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase(); // Chuyển về chữ thường
  };
  