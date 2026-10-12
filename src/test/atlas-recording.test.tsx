import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AtlasInterface } from "@/components/yvoo/AtlasInterface";
import orderVideo from "@/assets/atlas-reference/order.webm.asset.json";
import auditVideo from "@/assets/atlas-reference/audit.webm.asset.json";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("uses the previous second recording for Order", () => {
  const { container } = render(<AtlasInterface active progress={0.1} />);
  expect(container.querySelector("video")?.getAttribute("src")).toBe(auditVideo.url);
});

it("uses the previous first recording for Live audit", () => {
  const { container } = render(<AtlasInterface active progress={0.5} />);
  expect(container.querySelector("video")?.getAttribute("src")).toBe(orderVideo.url);
});

it.each([{ name: "Live audit", progress: 0.5 }, { name: "Report", progress: 0.9 }])("$name plays original audio", async ({ progress }) => {
  const { container, getByRole } = render(<AtlasInterface active progress={progress} />);
  const video = container.querySelector("video");
  expect(video).not.toBeNull();
  await waitFor(() => expect(video?.muted).toBe(false));
  fireEvent.click(getByRole("button", { name: "Mute recording" }));
  await waitFor(() => expect(video?.muted).toBe(true));
});

it("keeps playback available when the browser blocks audible autoplay", async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new DOMException("Blocked", "NotAllowedError"));
  const { container, getByRole } = render(<AtlasInterface active progress={0.5} />);
  await waitFor(() => expect(container.querySelector("video")?.muted).toBe(true));
  fireEvent.click(getByRole("button", { name: "Enable original audio" }));
  await waitFor(() => expect(container.querySelector("video")?.muted).toBe(false));
});