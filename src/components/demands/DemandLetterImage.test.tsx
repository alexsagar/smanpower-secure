import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemandLetterImage } from "./DemandLetterImage";

describe("DemandLetterImage", () => {
  it("renders a keyboard trigger, contained images and bounded Cloudinary delivery", () => {
    const html = renderToStaticMarkup(
      <DemandLetterImage
        src="https://res.cloudinary.com/demo/image/upload/v1/demand.png"
        alt="Demand letter for welders in Qatar"
        width={1000}
        height={1400}
      />
    );

    expect(html).toContain("Open full demand letter image");
    expect(html).toContain("Full demand letter image");
    expect(html).toContain("object-contain");
    expect(html).toContain("c_limit");
    expect(html).not.toContain("c_fill");
  });
});
