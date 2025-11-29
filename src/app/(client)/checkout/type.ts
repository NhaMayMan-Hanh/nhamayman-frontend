export interface CartItem {
  _id: string;
  ten_sp: string;
  gia_mua: number;
  hinh: string;
  so_luong: number;
}

export interface Province {
  code: number;
  name: string;
}
export interface District {
  code: number;
  name: string;
}
export interface Ward {
  code: number;
  name: string;
}
