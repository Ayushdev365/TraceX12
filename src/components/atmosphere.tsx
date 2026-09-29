import { usePointerLight } from "@/lib/pointer-light";

export function Atmosphere() {
  usePointerLight();
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-wash" />
      <div className="atmosphere-orb atmosphere-orb-a" />
      <div className="atmosphere-orb atmosphere-orb-b" />
      <div className="atmosphere-orb atmosphere-orb-c" />
      <div className="atmosphere-pointer" />
      <div className="atmosphere-grain" />
    </div>
  );
}
