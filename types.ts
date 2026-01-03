
export interface HubFeature {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  color: string;
  id: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  cta: string;
}
