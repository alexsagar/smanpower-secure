import { describe, expect, it } from "vitest";
import {
  mediaAssetMatchesPickerFilters,
  mergeMediaAssets,
} from "./MediaPicker";

const video = {
  id: "video-1",
  fileUrl: "https://cdn.example.com/video.mp4",
  fileName: "hero-video.mp4",
  folder: "cms",
  resourceType: "VIDEO" as const,
};

const image = {
  id: "image-1",
  fileUrl: "https://cdn.example.com/image.jpg",
  fileName: "hero-image.jpg",
  folder: "cms",
  resourceType: "IMAGE" as const,
};

describe("MediaPicker state helpers", () => {
  it("adds the completed upload asset immediately", () => {
    expect(mergeMediaAssets([], video)).toEqual([video]);
  });

  it("matches completed videos under the active VIDEO filter", () => {
    expect(mediaAssetMatchesPickerFilters(video, "", "VIDEO", ["VIDEO"])).toBe(true);
    expect(mediaAssetMatchesPickerFilters(image, "", "VIDEO", ["VIDEO"])).toBe(false);
  });

  it("matches completed images under the active IMAGE filter", () => {
    expect(mediaAssetMatchesPickerFilters(image, "", "IMAGE", ["IMAGE"])).toBe(true);
    expect(mediaAssetMatchesPickerFilters(video, "", "IMAGE", ["IMAGE"])).toBe(false);
  });

  it("preserves existing search and resource filters", () => {
    expect(mediaAssetMatchesPickerFilters(video, "hero-video", "VIDEO", ["VIDEO"])).toBe(true);
    expect(mediaAssetMatchesPickerFilters(video, "missing", "VIDEO", ["VIDEO"])).toBe(false);
  });

  it("deduplicates refreshed assets by stable id", () => {
    expect(mergeMediaAssets([video], [{ ...video, fileName: "fresh-name.mp4" }])).toEqual([
      { ...video, fileName: "fresh-name.mp4" },
    ]);
  });

  it("does not insert a fake asset when completion fails", () => {
    expect(mergeMediaAssets([image], undefined)).toEqual([image]);
  });
});
