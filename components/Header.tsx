import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">eMed</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href="#"
            className="rounded-full bg-[#14161F] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
          >
            Let's Connect
          </Link>
        </div>
      </div>
    </header>
  );
}
