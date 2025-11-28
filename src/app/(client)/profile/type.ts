export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  username: string;
  email: string;
  role: string;
  phone: string;
  address: {
    tinh_thanh: string;
    quan_huyen: string;
    phuong_xa: string;
    dia_chi_chi_tiet: string;
  };
  createdAt: string;
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
