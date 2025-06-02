
import abu from "../public/abuimage2.jpg";
import kongo from "../public/kongo.jpg";
import  abuth from "../public/abuth.jpg";
import Phase2 from "../public/phase2.jpg";
import shika from "../public/shika.jpeg";
import logo from "../public/ABUlog2.png";
import hero from "../public/hero-pattern.svg";



const images = {
  abu,
  kongo,
  shika,
  abuth,
  Phase2,
  logo,
  hero
};

export default images;

// TypeScript: Define a type for the images object
export type Images = typeof images;