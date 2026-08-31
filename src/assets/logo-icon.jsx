export default function LogoIcon({ className, ...props }) {
  return (
    <img
      src="/images/favicon.png"
      alt=""
      width={32}
      height={32}
      className={className}
      decoding="async"
      {...props}
    />
  );
}
