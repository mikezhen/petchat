import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <span className="text-6xl">🐾</span>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">PawCode</h1>
        <p className="text-gray-700 mt-3 text-lg">
          Smart QR tags for your pet. Update your contact info anytime.
          Get notified the moment your tag is scanned.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link
            href="/register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
