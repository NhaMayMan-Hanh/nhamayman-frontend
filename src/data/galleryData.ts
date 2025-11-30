export interface GalleryImage {
  src: string;
  alt: string;
  blogSlug?: string;
}

// Mảng fake data cho các banner gallery
export const galleryBanners: GalleryImage[][] = [
  // Gallery 1 - Sản phẩm handmade
  [
    { src: "/img/blogs/baiviet1/image8.jpg", alt: "Sản phẩm handmade 1", blogSlug: "baiviet1" },
    { src: "/img/blogs/baiviet1/image2.jpg", alt: "Sản phẩm handmade 2", blogSlug: "baiviet1" },
    { src: "/img/blogs/baiviet1/image3.jpg", alt: "Sản phẩm handmade 3", blogSlug: "baiviet1" },
    { src: "/img/blogs/baiviet1/image4.jpg", alt: "Sản phẩm handmade 4", blogSlug: "baiviet1" },
    { src: "/img/blogs/baiviet1/image5.jpg", alt: "Sản phẩm handmade 5", blogSlug: "baiviet1" },
    { src: "/img/blogs/baiviet1/image6.jpg", alt: "Sản phẩm handmade 6", blogSlug: "baiviet1" },
  ],
  // Gallery 2 - Tranh sơn dầu
  [
    { src: "/img/blogs/baiviet2/image11.jpg", alt: "Tranh sơn dầu 1", blogSlug: "baiviet2" },
    { src: "/img/blogs/baiviet2/image12.jpg", alt: "Tranh sơn dầu 2", blogSlug: "baiviet2" },
    { src: "/img/blogs/baiviet2/image13.jpg", alt: "Tranh sơn dầu 3", blogSlug: "baiviet2" },
    { src: "/img/blogs/baiviet2/image14.jpg", alt: "Tranh sơn dầu 4", blogSlug: "baiviet2" },
    { src: "/img/blogs/baiviet2/image5.jpg", alt: "Tranh sơn dầu 5", blogSlug: "baiviet2" },
    { src: "/img/blogs/baiviet2/image6.jpg", alt: "Tranh sơn dầu 6", blogSlug: "baiviet2" },
  ],
  // Gallery 3 - Bánh handmade
  //   [
  //     { src: "/img/blogs/baiviet3/image1.jpg", alt: "Bánh handmade 1", blogSlug: "baiviet3" },
  //     { src: "/img/blogs/baiviet3/image2.jpg", alt: "Bánh handmade 2", blogSlug: "baiviet3" },
  //     { src: "/img/blogs/baiviet3/image3.jpg", alt: "Bánh handmade 3", blogSlug: "baiviet3" },
  //     { src: "/img/blogs/baiviet3/image4.jpg", alt: "Bánh handmade 4", blogSlug: "baiviet3" },
  //     { src: "/img/blogs/baiviet3/image5.jpg", alt: "Bánh handmade 5", blogSlug: "baiviet3" },
  //     { src: "/img/blogs/baiviet3/image6.jpg", alt: "Bánh handmade 6", blogSlug: "baiviet3" },
  //   ],
];
