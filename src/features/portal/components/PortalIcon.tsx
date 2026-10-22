import type { LucideProps } from 'lucide-react';
import { Handshake, Radar, ReceiptText, ShieldCheck } from 'lucide-react';
import type { WhyUsIcon } from '../portal.content';

const ICONS: Record<WhyUsIcon, typeof Radar> = {
  radar: Radar,
  shield: ShieldCheck,
  receipt: ReceiptText,
  handshake: Handshake,
};

interface PortalIconProps extends LucideProps {
  name: WhyUsIcon;
}

export function PortalIcon({ name, ...props }: PortalIconProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
