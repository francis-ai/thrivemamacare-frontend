export const PLANS = [
  {
    name: "Free Tier",
    price: "₦0",
    duration: "",
    features: [
      "View 2 full caregiver profiles",
      "3rd profile: Limited details",
      "No shortlisting or contact access",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "One-Time Access",
    price: "₦20,000",
    duration: "3 months access",
    features: [
      "Unlimited profile views",
      "Shortlist favorite caregivers",
      "Contact details unlocked",
      "Add verifications later (₦25k-₦80k)",
    ],
    cta: "Upgrade Now",
  },
  {
    name: "All-Inclusive Bundle",
    price: "₦85,000",
    duration: "Save ₦15,000",
    features: [
      "Everything in One-Time Access",
      "NIN + Address Verification (₦25k)",
      "Insurance Cover (₦30k)",
      "Health Screening (₦25k)",
    ],
    cta: "Get Best Value",
    highlighted: true,
  },
];

export const ADD_ONS = [
  { name: "NIN + Address Verification", price: "₦25,000" },
  { name: "Insurance Cover (Theft/Loss)", price: "₦30,000" },
  { name: "Health Screening", price: "₦25,000" },
];