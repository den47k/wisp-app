import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrImageProps {
  value: string;
  size?: number;
}

export const QrImage = ({ value, size = 168 }: QrImageProps) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { width: size, margin: 0, color: { light: "#00000000" } })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!src) return <div className="wh-qr-skeleton" style={{ width: size, height: size }} />;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="Two-factor authentication QR code"
      className="wh-qr-img"
    />
  );
};
