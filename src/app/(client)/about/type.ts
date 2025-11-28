export interface Section {
  title: string;
  image: string;
  imagePosition: "left" | "right";
  content: string;
}

export interface About {
  _id: string;
  name: string;
  img: string;
  slug: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
  introSection?: string;
  sections?: Section[];
  closingSection?: string;
}
