export default function CatLogo({ size = 32, className, opacity }) {
  return (
    <img
      className={className}
      width={size}
      height={size}
      src="/cat.png"
      alt=""
      draggable="false"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
