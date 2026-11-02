import { notFound } from 'next/navigation';

// Unknown paths inside a locale render app/[locale]/not-found.jsx.
export default function CatchAll() {
  notFound();
}
