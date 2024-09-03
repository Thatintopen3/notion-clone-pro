export const PRICING_PLANS = { proplan: "Pro Plan", freeplan: "Free Plan" } as const;

export const PRICING_CARDS = [
  {
    planType: "Free Plan",
    price: "0",
    description: "Limited block trials  ",
    highlightFeature: "",
    freatures: [
      "Unlimited blocks for teams",
      "Unlimited file uploads",
      "30 day page history",
      "Invite 2 guests",
    ],
  },
  {
    planType: "Pro Plan",
    price: "12.99",
    description: "Billed annually. $17 billed monthly",
    highlightFeature: "Everything in Free +",
    freatures: [
      "Unlimited blocks for teams",
      "Unlimited file uploads",
      "1 year day page history",
      "Invite 10 guests",
    ],
  },
];

export const USERS = [
  { name: "Alice Johnson", message: "Cypress has transformed how our team collaborates. The real-time syncing is phenomenal and keeps everyone on the same page." },
  { name: "Bob Williams", message: "I've tried many productivity tools, but Cypress stands out. Its intuitive interface and powerful features have significantly boosted my workflow." },
  { name: "Charlie Brown", message: "As a project manager, I rely on Cypress daily. Its comprehensive tools and seamless integrations make managing complex projects effortless." },
  { name: "Diana Clark", message: "Cypress's flexibility is unparalleled. Whether I'm drafting documents or planning projects, it adapts to my needs perfectly." },
  { name: "Evan Smith", message: "The best productivity app out there. Cypress has everything you need and then some. My go-to tool for all my organizational needs." },
];

export const CLIENTS = [
  { alt: "client1", logo: "/placeholder-logo.svg" },
  { alt: "client2", logo: "/placeholder-logo.svg" },
  { alt: "client3", logo: "/placeholder-logo.svg" },
  { alt: "client4", logo: "/placeholder-logo.svg" },
  { alt: "client5", logo: "/placeholder-logo.svg" },
];

export const MAX_FOLDERS_FREE_PLAN = 3;
