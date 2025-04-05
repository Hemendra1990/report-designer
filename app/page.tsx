import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden text-center md:py-24 lg:py-32">
        <div className="relative z-10 max-w-4xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Advanced Report Designer
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Create customized reports with our powerful and intuitive report designer.
            Easily analyze and visualize your data with flexible report types.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/reports">
              <Button size="lg">View Reports</Button>
            </Link>
            <Link href="/report-builder">
              <Button variant="outline" size="lg">Create New Report</Button>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--foreground-rgb),0.15),transparent_70%)]"></div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Powerful Report Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create insightful and actionable reports
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="p-6 space-y-4 bg-card rounded-lg border">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted md:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to create powerful reports?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of analysts making data-driven decisions
            </p>
            <div className="mt-8">
              <Link href="/reports">
                <Button size="lg">Browse Reports</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/next.svg"
                alt="Report Designer Logo"
                width={80}
                height={20}
                className="dark:invert"
              />
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:underline">About</a>
              <a href="#" className="hover:underline">Features</a>
              <a href="#" className="hover:underline">Support</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Report Designer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature data
const features = [
  {
    title: "Multiple Report Types",
    description: "Choose from tabular, summary, matrix, and joined reports to fit your data analysis needs.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    )
  },
  {
    title: "Custom Formulas",
    description: "Create custom calculations and formulas to derive insights from your raw data.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
        <path d="M2 9v1c0 1.1.9 2 2 2h1" />
        <path d="M16 11h0" />
      </svg>
    )
  },
  {
    title: "Advanced Filtering",
    description: "Filter your data with powerful conditions to focus on what matters most.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    )
  },
  {
    title: "Dynamic Dashboards",
    description: "Combine multiple reports into interactive dashboards for comprehensive insights.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )
  },
  {
    title: "Data Visualization",
    description: "Transform your data into charts, graphs, and visual representations for easier understanding.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    )
  },
  {
    title: "Scheduled Reports",
    description: "Set up automatic report generation and distribution on your preferred schedule.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }
];