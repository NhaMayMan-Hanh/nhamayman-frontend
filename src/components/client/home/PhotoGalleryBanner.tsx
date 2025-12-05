"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  blogSlug?: string;
}

interface PhotoGalleryBannerProps {
  images: GalleryImage[];
  title?: string;
}

export default function PhotoGalleryBanner({ images, title }: PhotoGalleryBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMobile, setShowMobile] = useState(false);

  // Lấy tối đa 6 ảnh
  const displayImages = images.slice(0, 6);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Bố cục khác nhau cho số lượng ảnh khác nhau
  const getLayoutClass = (index: number, total: number) => {
    if (total === 1) return "col-span-2 row-span-2";
    if (total === 2) return "col-span-1 row-span-2";
    if (total === 3) {
      if (index === 0) return "col-span-2 row-span-2";
      return "col-span-1 row-span-1";
    }
    if (total === 4) {
      if (index === 0) return "col-span-2 row-span-2";
      return "col-span-1 row-span-1";
    }
    if (total === 5) {
      if (index === 0 || index === 1) return "col-span-1 row-span-2";
      return "col-span-1 row-span-1";
    }
    // 6 ảnh - bố cục lộn xộn
    const layouts = [
      "col-span-1 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
      "col-span-1 row-span-2",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
    ];
    return layouts[index] || "col-span-1 row-span-1";
  };

  // Rotation ngẫu nhiên cho hiệu ứng "ảnh dán lộn xộn"
  const getRotation = (index: number) => {
    const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-3", "rotate-1"];
    return rotations[index % rotations.length];
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block my-12">
        {title && <h3 className="text-3xl font-semibold mb-6 text-center">{title}</h3>}

        <div className="grid grid-cols-3 gap-4 auto-rows-[200px] p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className={`${getLayoutClass(index, displayImages.length)} ${getRotation(index)} 
                relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl 
                transition-all duration-300 hover:scale-105 hover:z-10 cursor-pointer
                bg-white p-2 border-4 border-white`}
              onClick={() => openModal(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View - Collapsed by default */}
      <div className="md:hidden my-8">
        {!showMobile ? (
          <div className="text-center">
            <button
              onClick={() => setShowMobile(true)}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-md"
            >
              📸 Xem thư viện ảnh ({displayImages.length} ảnh)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Thư viện ảnh</h3>
              <button
                onClick={() => setShowMobile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Thu gọn ▲
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {displayImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer 
                    hover:shadow-xl transition-all duration-300 bg-white p-2 border-2 border-white"
                  onClick={() => openModal(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Lightbox */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black/50 p-2 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black/50 p-2 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={displayImages[currentIndex].src}
              alt={displayImages[currentIndex].alt}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
