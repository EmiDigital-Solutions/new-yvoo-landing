import workScene from "@/assets/auditor-cinema-work.jpg";
import campusScene from "@/assets/auditor-campus-scene.jpg";
import precisionScene from "@/assets/auditor-precision-scene.jpg";
import officeScene from "@/assets/walk-office-clear.jpg";

const worlds = [workScene, campusScene, precisionScene, officeScene, precisionScene, campusScene];
export function AuditorJourneyBackdrop() {
  return <div className="aj-backdrop" aria-hidden="true">{worlds.map((image, index) => <div className={`aj-world aj-world-${index}`} key={index}>
    <div className="aj-image"><img src={image} width={1920} height={1080} alt="" loading={index === 0 ? "eager" : "lazy"} /></div>
    <div className="aj-shade" />
    <div className="aj-threshold" />
    {index === 2 && <div className="aj-measure"><i /><i /><i /></div>}
    {index === 3 && <div className="aj-payment-path"><i /><i /><i /><i /></div>}
  </div>)}</div>;
}
