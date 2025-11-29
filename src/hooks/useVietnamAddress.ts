import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export type Province = { code: number; name: string };
export type District = { code: number; name: string };
export type Ward = { code: number; name: string };

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("vn_provinces");
    if (cached) {
      setProvinces(JSON.parse(cached));
      return;
    }

    const loadProvinces = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
        localStorage.setItem("vn_provinces", JSON.stringify(data));
      } catch {
        toast.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoading(false);
      }
    };
    loadProvinces();
  }, []);

  const loadDistricts = async (provinceCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch {
      toast.error("Lỗi tải quận/huyện");
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (districtCode: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      setWards(data.wards || []);
    } catch {
      toast.error("Lỗi tải phường/xã");
    } finally {
      setLoading(false);
    }
  };

  return { provinces, districts, wards, loading, loadDistricts, loadWards };
}
