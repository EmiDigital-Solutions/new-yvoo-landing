import f1 from "@/assets/auditor-film-1.mp4.asset.json";
import f2 from "@/assets/auditor-film-2.mp4.asset.json";
import f3 from "@/assets/auditor-film-3.mp4.asset.json";
import f4 from "@/assets/auditor-film-4.mp4.asset.json";
import f5 from "@/assets/auditor-film-5.mp4.asset.json";
import f6 from "@/assets/auditor-film-6.mp4.asset.json";

const films = [f1, f2, f3, f4, f5, f6];

/** Real film scenes cross-dissolve with a camera push driven by the shared scroll score (--tint-N). */
export function AuditorFilmBackdrop() {
  return <div className="af-backdrop" aria-hidden="true">
    {films.map((film, i) => <div key={film.url} className="af-film" style={{ opacity: `var(--tint-${i},${i === 0 ? 1 : 0})`, ["--t" as string]: `var(--tint-${i},${i === 0 ? 1 : 0})` }}>
      <video src={film.url} autoPlay muted loop playsInline preload={i < 2 ? "auto" : "metadata"} />
    </div>)}
    <div className="af-shade" />
  </div>;
}
