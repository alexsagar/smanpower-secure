import { describe, expect, it } from "vitest";
import { getCloudinaryImageUrl } from "./cloudinary-delivery";

describe("getCloudinaryImageUrl", () => {
  it("adds responsive automatic delivery transforms to Cloudinary images", () => {
    expect(getCloudinaryImageUrl("https://res.cloudinary.com/demo/image/upload/v1/logo.png", { width: 192, height: 192 }))
      .toContain("/image/upload/f_auto,q_auto,c_limit,w_192,h_192/v1/logo.png");
  });

  it("keeps existing transforms and non-Cloudinary URLs safe", () => {
    expect(getCloudinaryImageUrl("https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_192,h_192/v1/logo.png", { width: 192, height: 192 }))
      .toBe("https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_192,h_192/v1/logo.png");
    expect(getCloudinaryImageUrl("https://example.com/logo.png", { width: 192 })).toBe("https://example.com/logo.png");
  });
});
