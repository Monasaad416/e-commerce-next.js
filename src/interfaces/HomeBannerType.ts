export interface IHomeBannerProps {
  title?: string;
  subtitle?: string;
  btnText?: string;
  btnLink?: string;
  imageUrl?: string;
  eyebrow?: string;
  trustPoints?: string[];
  stats?: Array<{ value: string; label: string }>;
}
