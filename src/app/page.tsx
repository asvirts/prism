import Link from "next/link"

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Prism Business Intelligence Dashboard
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Turn your data into actionable insights with AI-powered analysis,
              interactive visualizations, and comprehensive reporting.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Go to Dashboard
              </Link>
              <a
                href="https://github.com/yourusername/prism"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                View on GitHub <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-24 sm:py-32">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                Data Integration
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Connect to any data source
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Import data from CSV files, APIs, databases, and more. Clean and
                transform your data for analysis with ease.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                AI-Powered Analysis
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Uncover hidden insights
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Our AI engine automatically identifies trends, anomalies, and
                correlations in your data, helping you make data-driven
                decisions faster.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                Interactive Visualizations
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Beautiful, actionable charts
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Create custom charts and dashboards to visualize your data.
                Share interactive reports with your team.
              </p>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
    </div>
  )
}
