import Image from "next/image";

interface AdImageProps {
  src: string;
  alt?: string;
}

export default function AdImage({ src, alt = "Ad Image" }: AdImageProps) {
  return (
    <div className="w-full my-8">
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={200}
        className="w-full h-[300px] rounded-2xl object-cover shadow-md"
      />
    </div>
  );
}
