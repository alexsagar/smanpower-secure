import { describe, expect, it } from "vitest";
import { getPublishedEmployerTestimonials } from "./EmployerTestimonialsBlock";

describe("getPublishedEmployerTestimonials", () => {
  it("keeps only complete, published employer testimonials in CMS order", () => {
    const testimonials = getPublishedEmployerTestimonials({
      testimonials: [
        { quote: "Hidden", personName: "A", companyName: "Alpha", isPublished: false },
        { quote: "Visible", personName: "B", designation: "Director", companyName: "Beta", country: "Qatar", companyLogo: "/images/beta.png", isPublished: true },
        { quote: "Incomplete", personName: "C", isPublished: true },
      ],
    });

    expect(testimonials).toEqual([{
      id: "B-Beta-1",
      quote: "Visible",
      personName: "B",
      designation: "Director",
      companyName: "Beta",
      country: "Qatar",
      companyLogo: "/images/beta.png",
    }]);
  });
});
