// Content for SUSU BOX. Edit this file to change the text on the public pages.
// `team` and `projects` are only the starting content: after that they are managed in Admin → Team / Projects.

export const company = {
  name: "SUSU BOX",
  tagline: "Insurance that grows with you",
  phone: "+233 30 000 0000",
  whatsapp: "+233 20 000 0000",
  email: "hello@susubox.com",
  address: "12 Independence Avenue, Accra, Ghana",
  hours: "Mon – Fri, 8:00am – 5:00pm",
};

export const products = [
  {
    slug: "health",
    name: "Health Cover",
    icon: "HeartPulse",
    summary: "Hospital bills, outpatient visits and medicines covered for you and your family.",
    from: "GH₵ 2 / day",
    plans: [{ name: "Basic", monthly: 60 }, { name: "Family", monthly: 120 }, { name: "Premium", monthly: 200 }],
    benefits: ["Outpatient & inpatient care", "Maternity support", "Nationwide hospital network"],
    claimTypes: ["Hospital bill", "Medication", "Maternity", "Other"],
  },
  {
    slug: "life",
    name: "Life & Funeral",
    icon: "Sprout",
    summary: "Peace of mind that the people you love are cared for, whatever happens.",
    from: "GH₵ 1 / day",
    plans: [{ name: "Individual", monthly: 30 }, { name: "Family", monthly: 75 }, { name: "Education Saver", monthly: 150 }],
    benefits: ["Lump-sum payout to family", "Funeral cover within 48 hours", "Optional savings plan"],
    claimTypes: ["Death of insured", "Funeral support", "Other"],
  },
  {
    slug: "motor",
    name: "Motor Insurance",
    icon: "CarFront",
    summary: "Comprehensive and third-party cover for private cars, taxis and trotros.",
    from: "GH₵ 5 / day",
    plans: [{ name: "Third Party", monthly: 150 }, { name: "Third Party, Fire & Theft", monthly: 220 }, { name: "Comprehensive", monthly: 400 }],
    benefits: ["24/7 roadside help", "Fast claims in 7 days", "Commercial vehicle options"],
    claimTypes: ["Accident damage", "Theft", "Fire", "Third-party injury", "Other"],
  },
  {
    slug: "property",
    name: "Home & Shop",
    icon: "Store",
    summary: "Protect your home, shop and stock against fire, flood and theft.",
    from: "GH₵ 3 / day",
    plans: [{ name: "Home", monthly: 90 }, { name: "Shop & Stock", monthly: 130 }, { name: "Home + Shop", monthly: 200 }],
    benefits: ["Fire, flood & burglary", "Stock replacement", "Market trader packages"],
    claimTypes: ["Fire", "Flood", "Burglary or theft", "Other"],
  },
] as const;

export const stats = [
  { value: "48,000+", label: "Customers protected" },
  { value: "16", label: "Regions served" },
  { value: "GH₵ 12M", label: "Claims paid" },
  { value: "7 days", label: "Average claim payout" },
];

export const timeline = [
  { year: "2012", title: "A box under the counter", text: "SUSU BOX began in Makola Market as a small susu group helping traders save daily for emergencies." },
  { year: "2015", title: "From savings to protection", text: "Members asked for more than savings. We partnered with underwriters to launch our first micro-health plan." },
  { year: "2018", title: "Licensed insurer", text: "SUSU BOX became a fully licensed insurance company and opened offices in Kumasi and Takoradi." },
  { year: "2021", title: "Insurance on your phone", text: "Customers could now pay premiums by mobile money and apply for cover without visiting a branch." },
  { year: "2024", title: "Nationwide", text: "With agents in all 16 regions, SUSU BOX now protects tens of thousands of families and businesses." },
];

export const values = [
  { title: "Mission", text: "To make dependable insurance simple and affordable for every Ghanaian, one small contribution at a time." },
  { title: "Vision", text: "A Ghana where no family or business is set back by the unexpected." },
  { title: "Values", text: "Trust, simplicity, community and speed in everything we do, especially when paying claims." },
];

export const team = [
  { slug: "akosua-mensah", name: "Akosua Mensah", role: "Chief Executive Officer", dept: "Leadership", bio: "Founded SUSU BOX after 15 years in microfinance." },
  { slug: "kwame-asante", name: "Kwame Asante", role: "Chief Operations Officer", dept: "Leadership", bio: "Leads our branches, agents and customer care." },
  { slug: "efua-owusu", name: "Efua Owusu", role: "Head of Underwriting", dept: "Leadership", bio: "Designs plans that fit real lives and real budgets." },
  { slug: "yaw-darko", name: "Yaw Darko", role: "Head of Claims", dept: "Operations", bio: "Keeps our promise of paying claims within 7 days." },
  { slug: "abena-kyei", name: "Abena Kyei", role: "Customer Experience Lead", dept: "Operations", bio: "Makes sure every customer is heard and helped." },
  { slug: "kofi-boateng", name: "Kofi Boateng", role: "Lead Engineer", dept: "Technology", bio: "Builds the tools behind our mobile money payments." },
  { slug: "ama-serwaa", name: "Ama Serwaa", role: "Marketing Manager", dept: "Marketing", bio: "Tells the SUSU BOX story across Ghana." },
  { slug: "nana-yeboah", name: "Nana Yeboah", role: "Field Agent Coordinator", dept: "Operations", bio: "Supports our 600+ agents in markets nationwide." },
];

export const projects = [
  { title: "Market Women Health Drive", place: "Makola, Accra", year: "2024", tag: "Health", text: "Free health screenings and enrolment for 3,000 market traders, with 6 months of subsidised cover." },
  { title: "Okada Rider Safety Programme", place: "Kumasi", year: "2023", tag: "Motor", text: "Helmets, road-safety training and accident cover for 1,200 commercial riders." },
  { title: "Fire-Safe Markets", place: "Kantamanto & Kejetia", year: "2023", tag: "Property", text: "Installed fire extinguishers and trained traders after market fire outbreaks." },
  { title: "School Fees Saver", place: "Tamale", year: "2022", tag: "Education", text: "A savings-linked life plan that guarantees a child's school fees if a parent passes away." },
  { title: "Farmers' Weather Cover Pilot", place: "Bono East", year: "2022", tag: "Agriculture", text: "Piloted crop cover that pays out automatically when rainfall falls below normal." },
  { title: "Financial Literacy Tour", place: "16 regions", year: "2021", tag: "Community", text: "Workshops reaching 20,000 people on saving, budgeting and how insurance works." },
];

export const CONTACT_TOPICS = ["General enquiry", "Claims", "Payments", "Become an agent", "Complaint"];

export const regions = [
  "Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Volta", "Northern", "Upper East",
  "Upper West", "Bono", "Bono East", "Ahafo", "Western North", "Oti", "Savannah", "North East",
];

/** Monthly premium in GH₵ for a product + plan, or undefined if the combination doesn't exist. */
export function planPrice(productName: string, planName: string): number | undefined {
  return products.find((p) => p.name === productName)?.plans.find((pl) => pl.name === planName)?.monthly;
}

export const cedis = (amount: number) => `GH₵ ${amount.toLocaleString("en-GH")}`;

/** The kinds of claim a customer can make on a product. */
export const claimTypesFor = (productName: string): readonly string[] =>
  products.find((p) => p.name === productName)?.claimTypes ?? ["Other"];
