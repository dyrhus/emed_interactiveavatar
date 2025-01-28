export default function Hero() {
  return (
    <section className="w-full py-8 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-[#14161F] sm:text-5xl md:text-6xl lg:text-7xl">
              Experience the Future of Weight Management
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
              Take an interactive tour of our comprehensive weight loss program that
              combines cutting-edge technology with personalized healthcare support.
            </p>
          </div>
          <div className="space-y-12">
            <div className="flex flex-wrap justify-center gap-10">
              <div className="flex items-center space-x-2">
                <svg
                  className=" h-5 w-5 text-green-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-gray-600">Personalized Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className=" h-5 w-5 text-green-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-gray-600">AI-Powered Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className=" h-5 w-5 text-green-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-gray-600">24/7 Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className=" h-5 w-5 text-green-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-gray-600">Expert Guidance</span>
              </div>
            </div>
            <button
              onClick={() => {
                document.getElementById('interactive')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#14161F] px-8 text-sm font-medium text-white transition-colors hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
            >
              Start Interactive Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
