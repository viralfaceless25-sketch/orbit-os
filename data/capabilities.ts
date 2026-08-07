export interface Capability {
  name: string;
  status: "Available";
  usefulFor: string[];
  outputs: string[];
}

export const capabilities: Capability[] = [
  {
    name: "Web Development",
    status: "Available",
    usefulFor: ["Marketing websites", "Web applications", "Dashboards", "Portfolios", "Landing pages"],
    outputs: ["Design", "Frontend", "Backend", "Deployment"],
  },
  {
    name: "AI Systems",
    status: "Available",
    usefulFor: ["Assistants", "Retrieval systems", "Workflows", "Automations", "Integrations"],
    outputs: ["Architecture", "Agent design", "Integration", "Deployment"],
  },
  {
    name: "Product Prototyping",
    status: "Available",
    usefulFor: ["Testing an idea", "Pitching investors or partners", "Early users"],
    outputs: ["Working prototype", "Core system design", "Fast iteration"],
  },
  {
    name: "Technical Collaboration",
    status: "Available",
    usefulFor: ["Architecture review", "Integrations", "Debugging", "Deployment help"],
    outputs: ["Clear technical direction", "Fixes", "Shipped deployment"],
  },
];
